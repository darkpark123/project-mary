import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { decryptField } from "@/lib/crypto";
import PassportForm, { type PassportData } from "./PassportForm";
import EndorsementForm from "./EndorsementForm";

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function PassportPage() {
  const user = await requireUser("CLINICIAN");

  const profile = await db.clinicianProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: { credentials: true, capabilities: true, languages: true, availability: true, serviceRecords: true, endorsements: true },
  });

  const initial: PassportData = {
    fullName: profile.fullName,
    specialty: profile.specialty,
    yearsInPractice: profile.yearsInPractice,
    bio: profile.bio,
    willingToLead: profile.willingToLead,
    regionPrefs: profile.regionPrefs,
    tripLengthPrefDays: profile.tripLengthPrefDays,
    credentials: profile.credentials.map(({ licenseNumber, issuingBody, country, specialty }) => ({
      licenseNumber: decryptField(licenseNumber),
      issuingBody,
      country,
      specialty,
    })),
    capabilities: profile.capabilities.map(({ name, lowResourceCompetent }) => ({ name, lowResourceCompetent })),
    languages: profile.languages.map(({ language, proficiency }) => ({ language, proficiency })),
    availability: profile.availability.map((a) => ({
      startDate: toDateInput(a.startDate),
      endDate: toDateInput(a.endDate),
      flexible: a.flexible,
    })),
    serviceRecords: profile.serviceRecords.map((s) => ({
      tripName: s.tripName,
      role: s.role,
      startDate: toDateInput(s.startDate),
      endDate: toDateInput(s.endDate),
      leaderReference: s.leaderReference,
    })),
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Clinician Passport</h1>
        <p className="mt-1 text-sm text-slate-600">
          Verification status:{" "}
          <span className="font-medium">{profile.verificationStatus}</span>
          {profile.verificationStatus === "PENDING" && " - reviewed manually while we're small."}
        </p>
      </div>

      <PassportForm initial={initial} />

      <section className="space-y-3 border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">Pastor / church endorsement</h2>
        <p className="text-sm text-slate-600">
          One-click request to your sending pastor. This is the trust layer secular platforms
          don&apos;t have.
        </p>
        {profile.endorsements.length > 0 && (
          <ul className="space-y-1 text-sm">
            {profile.endorsements.map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                <span>
                  {e.endorserName} ({e.church})
                </span>
                <span className={e.confirmedAt ? "text-teal-700" : "text-amber-600"}>
                  {e.confirmedAt ? "Confirmed" : "Awaiting confirmation"}
                </span>
              </li>
            ))}
          </ul>
        )}
        <EndorsementForm />
      </section>
    </div>
  );
}
