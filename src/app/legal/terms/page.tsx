import Link from "next/link";
import LegalDoc from "@/components/LegalDoc";
import { CONTACT_EMAIL, LAST_UPDATED, SITE_NAME } from "@/lib/site";

export const metadata = { title: "Terms & Conditions - Project Mary" };

export default function TermsPage() {
  return (
    <LegalDoc>
      <h1 className="text-2xl font-bold text-slate-900">Terms &amp; Conditions</h1>
      <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Draft notice:</strong> this is a starting template, not a document reviewed by
        an attorney. {SITE_NAME} has not yet had counsel review these terms. Do not treat this
        page as legal advice, and do not rely on it as a finished, binding contract until a
        lawyer has reviewed it - see §13.
      </div>

      <h2>1. What {SITE_NAME} is</h2>
      <p>
        {SITE_NAME} is an introduction and matching service that connects medical professionals
        ("Clinicians") with churches and mission organizations ("Organizations") running
        short-term medical mission trips. {SITE_NAME} is <strong>not</strong>:
      </p>
      <ul>
        <li>an employer of any Clinician or trip staff,</li>
        <li>a credentialing, licensing, or verification authority,</li>
        <li>a medical malpractice insurer,</li>
        <li>a travel agent, or</li>
        <li>a provider of clinical care, telemedicine, or medical records services.</li>
      </ul>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old to create an account. Clinicians represent that any
        license, credential, or qualification information they submit is accurate and current.
      </p>

      <h2>3. Verification is manual and limited</h2>
      <p>
        In this early stage, credential verification is performed manually by {SITE_NAME}{" "}
        staff, not by an automated or authoritative registry check. A "Verified" status on a
        Passport means {SITE_NAME} reviewed the submitted documents - it is not a guarantee of
        current licensure, and Organizations remain responsible for confirming a Clinician's
        credentials and legal eligibility to practice before any trip.
      </p>

      <h2>4. Licensing and legal compliance is the user's responsibility</h2>
      <p>
        Many destination countries require temporary registration, permits, or other legal
        steps before a foreign clinician may practice - even briefly, even in a informal
        setting. {SITE_NAME} publishes a compliance reference database as a courtesy, sourced
        from public research and periodically updated, but it is <strong>informational only</strong>.
        It is not legal advice, may be incomplete or out of date, and does not substitute for
        confirming requirements directly with the destination country's registering body.
        Clinicians and Organizations are solely responsible for complying with all applicable
        licensing, immigration, and health-practice laws.
      </p>

      <h2>5. No liability for trips, care, or outcomes</h2>
      <p>
        {SITE_NAME} does not organize, supervise, staff, or insure any trip. Organizations are
        solely responsible for the trips they list, including scope-of-practice assignments,
        supervision, safety, and any care provided. {SITE_NAME} is not a party to, and accepts
        no liability arising from, any trip, any clinical act, or any agreement a Clinician and
        Organization reach after being introduced through the platform.
      </p>

      <h2>6. Malpractice coverage</h2>
      <p>
        {SITE_NAME} does not provide malpractice insurance to Clinicians. Trip listings state
        whether the Organization represents that coverage is provided; confirm the scope and
        validity of that coverage directly with the Organization before traveling.
      </p>

      <h2>7. Child and vulnerable-person safeguarding</h2>
      <p>
        Some field sites serve children and other vulnerable people. A background-check status
        field exists on the Clinician Passport, but {SITE_NAME} does not itself run background
        checks, and a blank or "not started" status does not mean a check was performed
        elsewhere. Organizations are responsible for their own safeguarding policy and for
        deciding what checks to require before placing a Clinician with vulnerable populations.
      </p>

      <h2>8. Uploaded documents</h2>
      <p>
        You may upload license scans and background-check documents to your Passport. We
        encrypt these before storage and never link to them publicly, but {SITE_NAME} is{" "}
        <strong>not a consumer reporting agency</strong> and does not verify, generate, or
        vouch for the contents of anything you upload. If a background-check document is used
        to decide whether you're placed on a trip, consumer-reporting law in your jurisdiction
        (e.g. the US Fair Credit Reporting Act) may apply to that decision independently of
        anything in these Terms - {SITE_NAME} takes no position on and accepts no liability
        for how an Organization uses a document you share with them.
      </p>

      <h2>9. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>submit false credentials, identity information, or trip details,</li>
        <li>use the platform to recruit for care outside a Clinician's licensed scope of practice,</li>
        <li>scrape, resell, or bulk-export other users' data,</li>
        <li>use the platform for any unlawful purpose.</li>
      </ul>

      <h2>10. Fees</h2>
      <p>
        Clinician accounts are free. {SITE_NAME} may charge Organizations for posting or
        access in the future; any such fees will be disclosed before they apply.
      </p>

      <h2>11. Termination</h2>
      <p>
        {SITE_NAME} may suspend or remove an account that violates these terms, submits
        fraudulent information, or creates a safety risk to other users.
      </p>

      <h2>12. Governing law</h2>
      <p>
        Because {SITE_NAME} serves clinicians and organizations globally, governing law and
        dispute resolution terms are not yet finalized. This section will be completed once
        legal counsel has been engaged - see §13.
      </p>

      <h2>13. Changes to these terms</h2>
      <p>
        These terms are a working draft and will change, likely substantially, once reviewed
        by an attorney. Material changes will be posted here with an updated date.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-700 underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <p className="mt-6 text-sm">
        See also: <Link href="/legal/privacy" className="text-teal-700 underline">Privacy Policy</Link>,{" "}
        <Link href="/legal/cookies" className="text-teal-700 underline">Cookie Policy</Link>,{" "}
        <Link href="/legal/accessibility" className="text-teal-700 underline">Accessibility</Link>.
      </p>
    </LegalDoc>
  );
}
