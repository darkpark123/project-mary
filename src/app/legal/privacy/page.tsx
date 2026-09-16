import Link from "next/link";
import LegalDoc from "@/components/LegalDoc";
import { CONTACT_EMAIL, LAST_UPDATED, SITE_NAME } from "@/lib/site";

export const metadata = { title: "Privacy Policy - Project Mary" };

export default function PrivacyPage() {
  return (
    <LegalDoc>
      <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Draft notice:</strong> this is a starting template, not reviewed by a privacy
        attorney. It has not been assessed for GDPR, CCPA, PIPA, or any specific jurisdiction's
        requirements. Do not treat it as a finished compliance document - see §9.
      </div>

      <h2>1. What we collect</h2>
      <p>Depending on your role, we collect:</p>
      <ul>
        <li><strong>Account data:</strong> email address, hashed password, account role.</li>
        <li>
          <strong>Clinician Passport data:</strong> name, specialty, years in practice, bio,
          license numbers, issuing bodies, countries of licensure, procedure/skill
          capabilities, languages, availability dates, service history, and
          background-check status.
        </li>
        <li>
          <strong>Endorsement data:</strong> your endorser's (e.g. pastor's) name, email, and
          church affiliation, and their confirmation.
        </li>
        <li>
          <strong>Organization &amp; trip data:</strong> organization name, denomination,
          trip locations, dates, and role needs.
        </li>
        <li>
          <strong>Interest data:</strong> which trips a Clinician has expressed interest in.
        </li>
      </ul>

      <h2>2. Special categories of data</h2>
      <p>
        Two things we collect are treated as sensitive in many privacy laws (for example
        Article 9 and Article 10 of the EU/UK GDPR) and are collected only because they are
        core to how {SITE_NAME} works:
      </p>
      <ul>
        <li>
          <strong>Religious affiliation:</strong> your church and pastoral endorsement are
          part of the trust model described in the product itself. We only ask for this
          because you chose to build a Passport on a faith-based mission platform.
        </li>
        <li>
          <strong>Background-check status:</strong> a self-reported field, not a check we run
          ourselves. Leave it blank if you would rather not disclose it; Organizations may
          still ask you directly.
        </li>
      </ul>
      <p>
        Where local law requires explicit consent to process this kind of data, submitting it
        on your Passport is how you give that consent. You can remove it at any time by editing
        your Passport or contacting us.
      </p>

      <h2>3. Why we collect it</h2>
      <p>
        To operate the matching service described in our{" "}
        <Link href="/legal/terms">Terms</Link>: showing your Passport to Organizations you
        express interest with, matching you to trips, verifying credentials, and confirming
        pastoral endorsements. We do not sell your data, and we do not use it for advertising
        profiling.
      </p>

      <h2>4. Who sees it</h2>
      <ul>
        <li>Your full Passport is visible to Organizations for trips you express interest in.</li>
        <li>Trip listings are public to any visitor (location, dates, roles needed, ethics fields).</li>
        <li>Your endorser sees only the endorsement request, not your full Passport.</li>
        <li>We do not share your data with third parties for their own marketing purposes.</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>
        We currently use only a strictly-necessary session cookie to keep you signed in. See
        the <Link href="/legal/cookies">Cookie Policy</Link> for details and for what changes
        if advertising is added later.
      </p>

      <h2>6. Data retention and deletion</h2>
      <p>
        We retain account and Passport data while your account is active. You can request
        deletion of your account and associated data at any time by emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Sensitive documents (license
        scans, background-check evidence) are intended to be encrypted at rest with a written
        retention schedule before we accept uploads of them in production - that storage layer
        is not yet built (see §9).
      </p>

      <h2>7. International users</h2>
      <p>
        {SITE_NAME} is built for a global user base, including the EU/UK, Korea (PIPA), and
        other jurisdictions with cross-border transfer rules. We have not yet implemented a
        jurisdiction-specific legal basis, data-transfer mechanism (e.g. SCCs), or a designated
        representative in any region. Treat international protections as not yet in place
        until this notice is updated.
      </p>

      <h2>8. Children</h2>
      <p>
        {SITE_NAME} is not directed at children and accounts require you to be 18 or older.
        We do not knowingly collect data from children. Field sites may serve children as
        patients, but {SITE_NAME} does not collect patient data.
      </p>

      <h2>9. What is not yet in place</h2>
      <p>Being upfront about the gap between this policy and reality today:</p>
      <ul>
        <li>No attorney has reviewed this policy for any jurisdiction.</li>
        <li>Encrypted-at-rest storage for uploaded documents is not yet built.</li>
        <li>No formal data processing agreements exist with any sub-processor.</li>
        <li>No dedicated privacy contact or Data Protection Officer has been appointed.</li>
      </ul>
      <p>
        Get legal counsel involved before accepting real license scans, background-check
        documents, or launching to users outside a small trusted pilot group.
      </p>

      <h2>10. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, export, or delete
        your data, and to object to certain processing. To exercise any of these, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this policy or your data:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-700 underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </LegalDoc>
  );
}
