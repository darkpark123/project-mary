import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// Compliance data from spec §5 (2025 study of Ghana, Uganda, Guatemala) - the
// "moat" per §7. Seeded once; keep growing this list as the platform verifies
// more countries.
const countryRequirements = [
  {
    country: "Uganda",
    registeringBody: "Uganda Medical and Dental Practitioners Council",
    typicalLeadTimeWeeks: 6,
    documentsRequired: ["Home-country license", "Letters of reference", "Institutional invitation"],
    facilityRestriction: "",
  },
  {
    country: "Ghana",
    registeringBody: "Medical and Dental Council of Ghana",
    typicalLeadTimeWeeks: 8,
    documentsRequired: [
      "Home-country license",
      "Letters of reference",
      "Institutional invitation",
      "Interpol clearance",
    ],
    facilityRestriction: "Approved or accredited health facilities only",
  },
  {
    country: "Guatemala",
    registeringBody: "Colegio de Médicos y Cirujanos de Guatemala",
    typicalLeadTimeWeeks: 4,
    documentsRequired: ["Home-country license", "Institutional invitation", "Fee payment"],
    facilityRestriction: "",
  },
];

async function main() {
  for (const req of countryRequirements) {
    await db.countryRequirement.upsert({
      where: { country: req.country },
      update: {},
      create: req,
    });
  }

  const orgEmail = "demo-org@projectmary.org";
  const existingOrgUser = await db.user.findUnique({ where: { email: orgEmail } });
  if (!existingOrgUser) {
    const passwordHash = await bcrypt.hash("password123", 10);
    const orgUser = await db.user.create({
      data: {
        email: orgEmail,
        passwordHash,
        role: "ORG_ADMIN",
        organization: {
          create: { name: "Grace Medical Missions", denomination: "Non-denominational", verificationStatus: "VERIFIED" },
        },
      },
      include: { organization: true },
    });

    await db.trip.create({
      data: {
        organizationId: orgUser.organization!.id,
        country: "Uganda",
        region: "Mbale",
        hostSiteName: "Mbale Community Clinic",
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
        costToVolunteerUsd: 1800,
        malpracticeCovered: true,
        hostRequested: true,
        localPartnerNamed: true,
        continuityPlan: "Records handed to the local clinic staff; a follow-up nurse visits monthly.",
        description: "A rural clinic requesting a short-term surgical and general medicine team.",
        roleNeeds: {
          create: [
            { specialty: "General Surgery", count: 1, scopeOfPracticeNotes: "Licensed surgeons only" },
            { specialty: "Family Medicine", count: 2 },
            { specialty: "Nursing", count: 3 },
          ],
        },
      },
    });

    console.log(`Seeded demo organization login: ${orgEmail} / password123`);
  }

  console.log(`Seeded ${countryRequirements.length} country requirements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
