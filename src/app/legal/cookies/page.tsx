import LegalDoc from "@/components/LegalDoc";
import { CONTACT_EMAIL, LAST_UPDATED, SITE_NAME } from "@/lib/site";

export const metadata = { title: "Cookie Policy - Project Mary" };

export default function CookiesPage() {
  return (
    <LegalDoc>
      <h1 className="text-2xl font-bold text-slate-900">Cookie Policy</h1>
      <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

      <h2>What we use today</h2>
      <p>
        {SITE_NAME} currently sets exactly one cookie: a session cookie from our authentication
        system, used only to keep you signed in. It is strictly necessary - the site cannot
        recognize a logged-in user without it - so under most cookie-consent laws (e.g. the
        EU ePrivacy Directive) it does not require opt-in consent. We do not use analytics,
        tracking, or third-party marketing cookies at this time.
      </p>

      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Purpose</th>
            <th>Type</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Auth session cookie</td>
            <td>Keeps you signed in</td>
            <td>Strictly necessary</td>
            <td>Session / until sign-out</td>
          </tr>
        </tbody>
      </table>

      <h2>If advertising is added</h2>
      <p>
        We're considering advertising to support the free clinician side of the platform (see
        our monetization notes). If we add a third-party ad network, it will typically set its
        own cookies for ad measurement or personalization. Before that happens, this policy will
        be updated to name the network, its purpose, and a way to opt out - and the consent
        banner on this site will start asking for your choice on non-essential cookies, not just
        notifying you.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can block or delete cookies in your browser settings. Blocking the session cookie
        will sign you out and prevent staying signed in.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalDoc>
  );
}
