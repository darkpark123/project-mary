"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { encryptField } from "@/lib/crypto";
import { isRateLimited } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { storeDocument, deleteDocument as deleteStoredDocument } from "@/lib/storage";
import { auth, signIn, signOut } from "@/auth";
import {
  signupSchema,
  profileUpdateSchema,
  tripSchema,
  endorsementRequestSchema,
  documentUploadSchema,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
} from "@/lib/validation";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

async function issueVerificationEmail(userId: string, email: string) {
  const token = crypto.randomBytes(24).toString("hex");
  await db.emailVerificationToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS) },
  });
  const link = `/verify-email/${token}`;
  const result = await sendEmail(
    email,
    "Verify your Project Mary email",
    `<p>Confirm your email to finish setting up your account.</p>
     <p><a href="${link}">Verify email</a></p>
     <p>This link expires in 24 hours.</p>`
  );
  return { ...result, link };
}

async function requireVerifiedEmail(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { emailVerifiedAt: true } });
  if (!user?.emailVerifiedAt) {
    return "Verify your email first - check your inbox, or resend the link from your dashboard.";
  }
  return null;
}

type ActionResult = { error: string } | { error?: undefined };

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    name: formData.get("name"),
    termsAccepted: formData.get("termsAccepted"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email, password, role, name } = parsed.data;
  if (isRateLimited(`signup:${email}`, 3, 10 * 60_000)) {
    return { error: "Too many attempts with this email. Try again in a few minutes." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists" };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role,
      termsAcceptedAt: new Date(),
      ...(role === "CLINICIAN"
        ? {
            clinicianProfile: {
              create: { fullName: name, specialty: "", yearsInPractice: 0 },
            },
          }
        : { organization: { create: { name } } }),
    },
  });

  await issueVerificationEmail(user.id, email);

  await signIn("credentials", {
    email,
    password,
    redirectTo: role === "CLINICIAN" ? "/passport" : "/org/trips",
  });
  return {};
}

export async function resendVerificationEmail(): Promise<ActionResult | { link: string; sent: boolean }> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in" };

  if (isRateLimited(`resend-verify:${session.user.id}`, 3, 10 * 60_000)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const result = await issueVerificationEmail(session.user.id, session.user.email!);
  return { link: result.link, sent: result.sent };
}

export async function verifyEmail(token: string): Promise<{ error?: string }> {
  const record = await db.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return { error: "This verification link is invalid or has expired. Request a new one from your dashboard." };
  }

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    db.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  return {};
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (err) {
    // next-auth throws a special redirect error on success - only treat real
    // auth failures as errors, let the redirect propagate.
    if (err instanceof Error && err.message.includes("CredentialsSignin")) {
      return { error: "Invalid email or password" };
    }
    throw err;
  }
  return {};
}

type ProfilePayload = {
  fullName: string;
  specialty: string;
  yearsInPractice: number;
  bio: string;
  willingToLead: boolean;
  regionPrefs: string;
  tripLengthPrefDays: number | null;
  credentials: { licenseNumber: string; issuingBody: string; country: string; specialty: string }[];
  capabilities: { name: string; lowResourceCompetent: boolean }[];
  languages: { language: string; proficiency: string }[];
  availability: { startDate: string; endDate: string; flexible: boolean }[];
  serviceRecords: { tripName: string; role: string; startDate: string; endDate: string; leaderReference: string }[];
};

export async function updateProfile(payload: ProfilePayload): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLINICIAN") return { error: "Not signed in as a clinician" };

  const parsed = profileUpdateSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const profile = await db.clinicianProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Profile not found" };

  // ponytail: the passport form submits the whole picture at once, so we
  // replace the child collections wholesale in one transaction rather than
  // diffing rows - simplest correct thing at this scale (single editor, no
  // concurrent multi-tab editing to worry about).
  const {
    credentials,
    capabilities,
    languages,
    availability,
    serviceRecords,
    ...profileFields
  } = parsed.data;

  await db.$transaction([
    db.clinicianProfile.update({ where: { id: profile.id }, data: profileFields }),
    db.credential.deleteMany({ where: { profileId: profile.id } }),
    db.capability.deleteMany({ where: { profileId: profile.id } }),
    db.language.deleteMany({ where: { profileId: profile.id } }),
    db.availabilityWindow.deleteMany({ where: { profileId: profile.id } }),
    db.serviceRecord.deleteMany({ where: { profileId: profile.id } }),
    ...(credentials.length
      ? [
          db.credential.createMany({
            data: credentials.map((c) => ({
              ...c,
              licenseNumber: encryptField(c.licenseNumber),
              profileId: profile.id,
            })),
          }),
        ]
      : []),
    ...(capabilities.length
      ? [db.capability.createMany({ data: capabilities.map((c) => ({ ...c, profileId: profile.id })) })]
      : []),
    ...(languages.length
      ? [db.language.createMany({ data: languages.map((l) => ({ ...l, profileId: profile.id })) })]
      : []),
    ...(availability.length
      ? [db.availabilityWindow.createMany({ data: availability.map((a) => ({ ...a, profileId: profile.id })) })]
      : []),
    ...(serviceRecords.length
      ? [db.serviceRecord.createMany({ data: serviceRecords.map((s) => ({ ...s, profileId: profile.id })) })]
      : []),
  ]);

  revalidatePath("/passport");
  return {};
}

export async function requestEndorsement(
  formData: FormData
): Promise<ActionResult | { link: string; sent: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLINICIAN") return { error: "Not signed in as a clinician" };

  const verifyError = await requireVerifiedEmail(session.user.id);
  if (verifyError) return { error: verifyError };

  const parsed = endorsementRequestSchema.safeParse({
    endorserName: formData.get("endorserName"),
    endorserEmail: formData.get("endorserEmail"),
    church: formData.get("church"),
    relationship: formData.get("relationship"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const profile = await db.clinicianProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Profile not found" };

  const token = crypto.randomBytes(16).toString("hex");
  await db.endorsement.create({ data: { ...parsed.data, profileId: profile.id, token } });

  const link = `/endorse/${token}`;
  const result = await sendEmail(
    parsed.data.endorserEmail,
    `${profile.fullName} asked you to confirm an endorsement`,
    `<p>${profile.fullName} listed you (${parsed.data.relationship} at ${parsed.data.church}) as a reference
     to serve on medical mission trips through Project Mary.</p>
     <p><a href="${link}">Confirm this endorsement</a></p>`
  );

  revalidatePath("/passport");
  // ponytail: even when the email sends, hand back the link too - cheap
  // insurance against a spam filter, and the only path at all when no
  // RESEND_API_KEY is configured (see src/lib/email.ts).
  return { link, sent: result.sent };
}

export async function confirmEndorsement(token: string) {
  const endorsement = await db.endorsement.findUnique({ where: { token } });
  if (!endorsement || endorsement.confirmedAt) return;
  await db.endorsement.update({ where: { token }, data: { confirmedAt: new Date() } });
  revalidatePath(`/endorse/${token}`);
}

type TripPayload = {
  country: string;
  region: string;
  hostSiteName: string;
  startDate: string;
  endDate: string;
  costToVolunteerUsd: number;
  malpracticeCovered: boolean;
  hostRequested: boolean;
  localPartnerNamed: boolean;
  continuityPlan: string;
  description: string;
  roleNeeds: { specialty: string; count: number; scopeOfPracticeNotes: string }[];
};

export async function createTrip(payload: TripPayload): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORG_ADMIN") return { error: "Not signed in as an organization" };

  const verifyError = await requireVerifiedEmail(session.user.id);
  if (verifyError) return { error: verifyError };

  const parsed = tripSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await db.organization.findUnique({ where: { adminUserId: session.user.id } });
  if (!org) return { error: "Organization not found" };

  const { roleNeeds, ...tripData } = parsed.data;
  await db.trip.create({
    data: { ...tripData, organizationId: org.id, roleNeeds: { create: roleNeeds } },
  });

  redirect("/org/trips");
}

export async function expressInterest(tripId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLINICIAN") redirect("/login");

  const profile = await db.clinicianProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/passport");

  await db.interest.upsert({
    where: { tripId_profileId: { tripId, profileId: profile.id } },
    update: {},
    create: { tripId, profileId: profile.id },
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function uploadDocument(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLINICIAN") return { error: "Not signed in as a clinician" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a file" };
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return { error: "Only PDF, JPG, or PNG files are accepted" };
  }
  if (file.size > MAX_DOCUMENT_BYTES) return { error: "File must be under 10MB" };

  const parsed = documentUploadSchema.safeParse({
    kind: formData.get("kind"),
    label: formData.get("label"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const profile = await db.clinicianProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Profile not found" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const { storageBackend, storageKey } = await storeDocument(buffer, file.name);

  await db.document.create({
    data: {
      profileId: profile.id,
      kind: parsed.data.kind,
      label: parsed.data.label,
      storageBackend,
      storageKey,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  revalidatePath("/passport");
  return {};
}

export async function removeDocument(documentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLINICIAN") return { error: "Not signed in as a clinician" };

  const profile = await db.clinicianProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Profile not found" };

  const doc = await db.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.profileId !== profile.id) return { error: "Document not found" };

  await deleteStoredDocument(doc.storageBackend, doc.storageKey);
  await db.document.delete({ where: { id: documentId } });

  revalidatePath("/passport");
  return {};
}
