import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { confirmEndorsement } from "@/app/actions";

export default async function EndorsePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const endorsement = await db.endorsement.findUnique({
    where: { token },
    include: { profile: true },
  });
  if (!endorsement) notFound();

  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Confirm endorsement</h1>
      <p className="text-slate-600">
        {endorsement.endorserName}, you&apos;re confirming your endorsement of{" "}
        <strong>{endorsement.profile.fullName}</strong> to serve on medical mission trips, as
        their {endorsement.relationship.toLowerCase()} at {endorsement.church}.
      </p>

      {endorsement.confirmedAt ? (
        <p className="rounded-md bg-teal-50 p-3 text-teal-800">
          Confirmed on {endorsement.confirmedAt.toLocaleDateString()}. Thank you.
        </p>
      ) : (
        <form action={confirmEndorsement.bind(null, token)}>
          <button
            type="submit"
            className="rounded-md bg-teal-700 px-5 py-2 text-white hover:bg-teal-800"
          >
            Confirm endorsement
          </button>
        </form>
      )}
    </div>
  );
}
