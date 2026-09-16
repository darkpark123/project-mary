import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { expressInterest } from "@/app/actions";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const trip = await db.trip.findUnique({
    where: { id },
    include: { organization: true, roleNeeds: true },
  });
  if (!trip) notFound();

  const requirement = await db.countryRequirement.findUnique({ where: { country: trip.country } });

  let alreadyInterested = false;
  if (session?.user?.role === "CLINICIAN") {
    const profile = await db.clinicianProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) {
      const interest = await db.interest.findUnique({
        where: { tripId_profileId: { tripId: trip.id, profileId: profile.id } },
      });
      alreadyInterested = !!interest;
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {trip.country}
          {trip.region ? ` - ${trip.region}` : ""}
        </h1>
        <p className="text-slate-600">
          {trip.organization.name} · {trip.startDate.toLocaleDateString()} -{" "}
          {trip.endDate.toLocaleDateString()}
        </p>
      </div>

      {trip.description && <p className="text-slate-700">{trip.description}</p>}

      <section className="rounded-lg border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-900">Roles needed</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {trip.roleNeeds.map((r) => (
            <li key={r.id}>
              <span className="font-medium">{r.specialty}</span> - {r.filledCount}/{r.count} filled
              {r.scopeOfPracticeNotes && (
                <span className="text-slate-500"> · {r.scopeOfPracticeNotes}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-900">Ethics &amp; trust</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li>{trip.hostRequested ? "✓" : "✗"} Requested by the host site</li>
          <li>{trip.localPartnerNamed ? "✓" : "✗"} Named local clinical partner</li>
          <li>{trip.malpracticeCovered ? "✓" : "✗"} Malpractice coverage provided</li>
          <li>
            Continuity plan:{" "}
            {trip.continuityPlan ? trip.continuityPlan : <em className="text-slate-500">Not specified</em>}
          </li>
          <li>Cost to volunteer: ${trip.costToVolunteerUsd}</li>
        </ul>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="font-semibold text-slate-900">Registration &amp; compliance - {trip.country}</h2>
        {requirement ? (
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>
              Registering body: {requirement.registeringBody}
              {requirement.url && (
                <>
                  {" "}
                  (
                  <a href={requirement.url} className="underline" target="_blank" rel="noreferrer">
                    link
                  </a>
                  )
                </>
              )}
            </li>
            <li>Estimated lead time: {requirement.typicalLeadTimeWeeks} weeks</li>
            <li>
              Documents needed:{" "}
              {(requirement.documentsRequired as string[]).join(", ")}
            </li>
            {requirement.facilityRestriction && <li>Restriction: {requirement.facilityRestriction}</li>}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            No compliance data on file yet for {trip.country}. Confirm registration requirements
            directly with the organization before committing.
          </p>
        )}
      </section>

      {session?.user?.role === "CLINICIAN" ? (
        alreadyInterested ? (
          <p className="text-sm text-teal-700">
            You&apos;ve expressed interest. {trip.organization.name} has your Passport.
          </p>
        ) : (
          <form action={expressInterest.bind(null, trip.id)}>
            <button
              type="submit"
              className="rounded-md bg-teal-700 px-5 py-2 text-white hover:bg-teal-800"
            >
              I&apos;m interested
            </button>
          </form>
        )
      ) : session?.user ? (
        <p className="text-sm text-slate-500">Sign in as a clinician to express interest.</p>
      ) : (
        <Link href="/login" className="text-sm text-teal-700 underline">
          Sign in to express interest
        </Link>
      )}
    </div>
  );
}
