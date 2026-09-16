import { Resend } from "resend";

// ponytail: one function, one fallback path. When RESEND_API_KEY isn't set
// (local dev, or before you've created a Resend account), this logs the
// email and returns it instead of sending - callers already show the link
// in the UI as a backup (see actions.ts), so nothing is silently lost.
export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Project Mary <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[email:dev-fallback] to=${to} subject="${subject}"\n${html}`);
    return { sent: false as const };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("[email] send failed:", error);
    return { sent: false as const };
  }
  return { sent: true as const };
}
