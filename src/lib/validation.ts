import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CLINICIAN", "ORG_ADMIN"]),
  name: z.string().min(1, "Name is required"),
  termsAccepted: z.literal("on", { message: "You must accept the Terms and Privacy Policy" }),
});

export const documentUploadSchema = z.object({
  kind: z.enum(["LICENSE", "BACKGROUND_CHECK"]),
  label: z.string().default(""),
});

export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10MB

export const credentialSchema = z.object({
  licenseNumber: z.string().min(1),
  issuingBody: z.string().min(1),
  country: z.string().min(1),
  specialty: z.string().min(1),
});

export const capabilitySchema = z.object({
  name: z.string().min(1),
  lowResourceCompetent: z.boolean().default(false),
});

export const languageSchema = z.object({
  language: z.string().min(1),
  proficiency: z.enum(["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE"]),
});

export const availabilitySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    flexible: z.boolean().default(false),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const endorsementRequestSchema = z.object({
  endorserName: z.string().min(1),
  endorserEmail: z.string().email(),
  church: z.string().min(1),
  relationship: z.string().min(1),
});

export const serviceRecordSchema = z.object({
  tripName: z.string().min(1),
  role: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  leaderReference: z.string().default(""),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1),
  specialty: z.string().min(1),
  yearsInPractice: z.coerce.number().int().min(0),
  bio: z.string().default(""),
  willingToLead: z.boolean().default(false),
  regionPrefs: z.string().default(""),
  tripLengthPrefDays: z.coerce.number().int().min(0).nullable().optional(),
  backgroundCheckStatus: z.enum(["NOT_STARTED", "PENDING", "CLEARED"]).default("NOT_STARTED"),
  // Nested collections validated here too (not just the flat profile fields) -
  // these go straight into Prisma createMany in the server action, so an
  // empty date or blank required field must be caught before it gets there.
  credentials: z.array(credentialSchema).default([]),
  capabilities: z.array(capabilitySchema).default([]),
  languages: z.array(languageSchema).default([]),
  availability: z.array(availabilitySchema).default([]),
  serviceRecords: z.array(serviceRecordSchema).default([]),
});

export const tripSchema = z
  .object({
    country: z.string().min(1),
    region: z.string().default(""),
    hostSiteName: z.string().default(""),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    costToVolunteerUsd: z.coerce.number().int().min(0).default(0),
    malpracticeCovered: z.boolean().default(false),
    hostRequested: z.boolean().default(false),
    localPartnerNamed: z.boolean().default(false),
    continuityPlan: z.string().default(""),
    description: z.string().default(""),
    roleNeeds: z
      .array(
        z.object({
          specialty: z.string().min(1),
          count: z.coerce.number().int().min(1),
          scopeOfPracticeNotes: z.string().default(""),
        })
      )
      .min(1, "At least one role is needed"),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
