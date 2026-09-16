import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          The connective tissue between medical volunteers and the mission field.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Build a verified Clinician Passport once. Get matched to trips that need your
          specialty, on the dates you&apos;re actually free.
        </p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
          >
            Build your Passport
          </Link>
          <Link
            href="/trips"
            className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Browse trips
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Verified, portable profile</h2>
          <p className="mt-2 text-sm text-slate-600">
            Credentials, capabilities, languages and availability - built once, usable across
            every organization on the platform.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Compliance built in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Every trip shows the destination country&apos;s registration requirements and lead
            time, pulled from our compliance database.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Ethics you can filter on</h2>
          <p className="mt-2 text-sm text-slate-600">
            Host-requested trips, named local partners, continuity plans - visible on every
            listing, not buried in a PDF.
          </p>
        </div>
      </section>
    </div>
  );
}
