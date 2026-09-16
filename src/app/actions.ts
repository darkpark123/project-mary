"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { encryptField } from "@/lib/crypto";
import { isRateLimited } from "@/lib/rateLimit";
import { auth, signIn, signOut } from "@/auth";
import {
  signupSchema,
  profileUpdateSchema,
  tripSchema,
  endorsementRequestSchema,
} from "@/lib/validation";

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
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email, password, role, name } = parsed.data;
  if (isRateLimited(`signup:${email}`, 3, 10 * 60_000)) {
    return { error: "Too many attempts with this email. Try again in a few minutes." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists" };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      email,
      passwordHash,
      role,
      ...(role === "CLINICIAN"
        ? {
            clinicianProfile: {
              create: { fullName: name, specialty: "", yearsInPractice: 0 },
            },
          }
        : { organization: { create: { name } } }),
    },
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: role === "CLINICIAN" ? "/passport" : "/org/trips",
  });
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

export async function requestEndorsement(formData: FormData): Promise<ActionResult | { link: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLINICIAN") return { error: "Not signed in as a clinician" };

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

  revalidatePath("/passport");
  // ponytail: no email provider configured for local dev - hand back the
  // confirmation link so the clinician can send it themselves. Wire up
  // Resend/Postmark here (see spec §9) once real outbound email is set up.
  return { link: `/endorse/${token}` };
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
