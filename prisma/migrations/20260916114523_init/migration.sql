-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicianProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "yearsInPractice" INTEGER NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "bio" TEXT NOT NULL DEFAULT '',
    "willingToLead" BOOLEAN NOT NULL DEFAULT false,
    "regionPrefs" TEXT NOT NULL DEFAULT '',
    "tripLengthPrefDays" INTEGER,
    "backgroundCheckStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicianProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verifier" TEXT,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capability" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lowResourceCompetent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityWindow" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "flexible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AvailabilityWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endorsement" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "endorserName" TEXT NOT NULL,
    "endorserEmail" TEXT NOT NULL,
    "church" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRecord" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "tripName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "leaderReference" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ServiceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "denomination" TEXT NOT NULL DEFAULT '',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT '',
    "hostSiteName" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "costToVolunteerUsd" INTEGER NOT NULL DEFAULT 0,
    "malpracticeCovered" BOOLEAN NOT NULL DEFAULT false,
    "hostRequested" BOOLEAN NOT NULL DEFAULT false,
    "localPartnerNamed" BOOLEAN NOT NULL DEFAULT false,
    "continuityPlan" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleNeed" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "filledCount" INTEGER NOT NULL DEFAULT 0,
    "scopeOfPracticeNotes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "RoleNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryRequirement" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "registeringBody" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "documentsRequired" JSONB NOT NULL,
    "typicalLeadTimeWeeks" INTEGER NOT NULL,
    "facilityRestriction" TEXT NOT NULL DEFAULT '',
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CountryRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicianProfile_userId_key" ON "ClinicianProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Endorsement_token_key" ON "Endorsement"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_adminUserId_key" ON "Organization"("adminUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_tripId_profileId_key" ON "Interest"("tripId", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "CountryRequirement_country_key" ON "CountryRequirement"("country");

-- AddForeignKey
ALTER TABLE "ClinicianProfile" ADD CONSTRAINT "ClinicianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClinicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capability" ADD CONSTRAINT "Capability_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClinicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClinicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityWindow" ADD CONSTRAINT "AvailabilityWindow_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClinicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClinicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRecord" ADD CONSTRAINT "ServiceRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClinicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleNeed" ADD CONSTRAINT "RoleNeed_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClinicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
