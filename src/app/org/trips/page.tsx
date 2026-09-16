import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import EmailVerifiedBanner from "@/components/EmailVerifiedBanner";

export default async function OrgTripsPage() {
  const user = await requireUser("ORG_ADMIN");

  const org = await db.organization.findUniqueOrThrow({
    where: { adminUserId: user.id },
    include: {
      admin: { select: { emailVerifiedAt: true } },
      trips: {
        include: { roleNeeds: true, interests: { include: { profile: { include: { user: true } } } } },
        orderBy: { startDate: "asc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{org.name} - Trips</h1>
        <Link
          href="/org/trips/new"
          className="rounded-md bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800"
        >
          Post a trip
        </Link>
      </div>

      <EmailVerifiedBanner verified={!!org.admin.emailVerifiedAt} action="post a trip" />

      {org.trips.length === 0 && <p className="text-sm text-slate-500">No trips posted yet.</p>}

      <div className="space-y-4">
        {org.trips.map((trip) => (
          <div key={trip.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                {trip.country}
                {trip.region ? ` - ${trip.region}` : ""}
              </h2>
              <span className="text-sm text-slate-500">
                {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {trip.roleNeeds.map((r) => (
                <span key={r.id} className="rounded-full bg-slate-100 px-2 py-1">
                  {r.specialty} ({r.filledCount}/{r.count})
                </span>
              ))}
            </div>
            {trip.interests.length > 0 && (
              <div className="mt-3 text-sm">
                <p className="font-medium text-slate-700">Interested clinicians:</p>
                <ul className="mt-1 space-y-0.5 text-slate-600">
                  {trip.interests.map((i) => (
                    <li key={i.id}>
                      {i.profile.fullName} ({i.profile.specialty}) - {i.profile.user.email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
