import Link from "next/link";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSlot";
import type { Prisma } from "@/generated/prisma/client";

type SearchParams = {
  specialty?: string;
  region?: string;
  country?: string;
  maxCost?: string;
  hostRequested?: string;
  localPartnerNamed?: string;
};

function buildWhere(sp: SearchParams): Prisma.TripWhereInput {
  return {
    ...(sp.country && { country: { contains: sp.country, mode: "insensitive" } }),
    ...(sp.region && { region: { contains: sp.region, mode: "insensitive" } }),
    ...(sp.specialty && {
      roleNeeds: { some: { specialty: { contains: sp.specialty, mode: "insensitive" } } },
    }),
    ...(sp.maxCost && { costToVolunteerUsd: { lte: Number(sp.maxCost) } }),
    ...(sp.hostRequested === "1" && { hostRequested: true }),
    ...(sp.localPartnerNamed === "1" && { localPartnerNamed: true }),
  };
}

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const trips = await db.trip.findMany({
    where: buildWhere(sp),
    include: { organization: true, roleNeeds: true },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Trips</h1>

      <form className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-3">
        <input
          name="specialty"
          defaultValue={sp.specialty}
          placeholder="Specialty"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          name="region"
          defaultValue={sp.region}
          placeholder="Region"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          name="country"
          defaultValue={sp.country}
          placeholder="Country"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          name="maxCost"
          type="number"
          defaultValue={sp.maxCost}
          placeholder="Max cost to volunteer (USD)"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="hostRequested"
            value="1"
            defaultChecked={sp.hostRequested === "1"}
          />
          Host-requested only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="localPartnerNamed"
            value="1"
            defaultChecked={sp.localPartnerNamed === "1"}
          />
          Named local partner only
        </label>
        <button className="rounded-md bg-teal-700 px-3 py-1.5 text-sm text-white hover:bg-teal-800 sm:col-span-3">
          Filter
        </button>
      </form>

      <AdSlot />

      <div className="space-y-4">
        {trips.length === 0 && <p className="text-sm text-slate-500">No trips match those filters yet.</p>}
        {trips.map((trip) => (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className="block rounded-lg border border-slate-200 p-4 hover:border-teal-600"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                {trip.country}
                {trip.region ? ` - ${trip.region}` : ""}
              </h2>
              <span className="text-sm text-slate-500">
                {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{trip.organization.name}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {trip.roleNeeds.map((r) => (
                <span key={r.id} className="rounded-full bg-slate-100 px-2 py-1">
                  {r.specialty} ({r.filledCount}/{r.count})
                </span>
              ))}
              {trip.hostRequested && (
                <span className="rounded-full bg-teal-50 px-2 py-1 text-teal-700">Host-requested</span>
              )}
              {trip.localPartnerNamed && (
                <span className="rounded-full bg-teal-50 px-2 py-1 text-teal-700">Local partner</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
