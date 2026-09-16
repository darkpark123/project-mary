import LegalDoc from "@/components/LegalDoc";
import { CONTACT_EMAIL, LAST_UPDATED, SITE_NAME } from "@/lib/site";

export const metadata = { title: "Accessibility - Project Mary" };

export default function AccessibilityPage() {
  return (
    <LegalDoc>
      <h1 className="text-2xl font-bold text-slate-900">Accessibility Statement</h1>
      <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

      <h2>Our commitment</h2>
      <p>
        {SITE_NAME} aims to conform to WCAG 2.1 Level AA. We are an early-stage product and have
        not yet completed a formal accessibility audit, but the site is built with semantic
        HTML, labeled form fields, keyboard-operable controls, and native browser inputs
        (checkboxes, date pickers, selects) rather than custom widgets that often break screen
        reader and keyboard support.
      </p>

      <h2>What's already in place</h2>
      <ul>
        <li>Every form field has an associated, visible label.</li>
        <li>Native HTML form controls throughout (no custom dropdowns or date pickers).</li>
        <li>Color is never the only signal - status is also shown in text (e.g. "Confirmed", "Awaiting confirmation").</li>
        <li>Sufficient color contrast targeted in the default theme (dark text on white, teal accents).</li>
      </ul>

      <h2>Known gaps</h2>
      <ul>
        <li>No automated accessibility testing (e.g. axe, Lighthouse CI) is wired into the build yet.</li>
        <li>No manual screen reader (VoiceOver/NVDA) pass has been done yet.</li>
        <li>No skip-to-content link yet.</li>
      </ul>

      <h2>Feedback</h2>
      <p>
        If you use assistive technology and hit a barrier anywhere on {SITE_NAME}, please tell
        us - specific page and what happened helps most:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalDoc>
  );
}
