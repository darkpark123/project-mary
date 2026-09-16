import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata = { title: "Contact - Project Mary" };

export default function ContactPage() {
  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Contact</h1>

      <div className="rounded-lg border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900">General questions &amp; support</h2>
        <p className="mt-1 text-sm text-slate-600">
          Account issues, credential verification, trip questions, anything else about using{" "}
          {SITE_NAME}.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Project Mary support`}
          className="mt-3 inline-block rounded-md bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800"
        >
          Email {CONTACT_EMAIL}
        </a>
      </div>

      <div className="rounded-lg border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900">Advertising &amp; sponsorship</h2>
        <p className="mt-1 text-sm text-slate-600">
          Interested in a sponsored listing or banner placement? See our{" "}
          <a href="#advertise" className="text-teal-700 underline">
            advertising info
          </a>{" "}
          below, then reach out.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Project Mary advertising inquiry`}
          className="mt-3 inline-block rounded-md border border-teal-700 px-4 py-2 text-sm text-teal-700 hover:bg-teal-50"
        >
          Email about advertising
        </a>
      </div>

      <div id="advertise" className="rounded-lg border border-slate-200 p-5 text-sm text-slate-600">
        <h2 className="font-semibold text-slate-900">Advertising on {SITE_NAME}</h2>
        <p className="mt-1">
          We're open to sponsorships from organizations aligned with our mission - Christian
          medical fellowships, mission-focused insurers, travel medicine providers, and
          denominational bodies. Placements are limited and reviewed for fit; we do not run
          open ad-network inventory yet. Email us with what you have in mind.
        </p>
      </div>
    </div>
  );
}
