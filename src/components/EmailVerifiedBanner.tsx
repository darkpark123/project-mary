"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/app/actions";

export default function EmailVerifiedBanner({
  verified,
  action = "use every feature",
}: {
  verified: boolean;
  action?: string;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ error?: string; link?: string; sent?: boolean } | null>(null);

  if (verified) return null;

  async function handleResend() {
    setPending(true);
    const res = await resendVerificationEmail();
    setResult(res);
    setPending(false);
  }

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p>
        <strong>Verify your email</strong> to {action} - check your inbox for the link we sent when
        you signed up.
      </p>
      <button
        onClick={handleResend}
        disabled={pending}
        className="mt-2 rounded-md border border-amber-600 px-3 py-1 text-amber-900 hover:bg-amber-100 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Resend verification email"}
      </button>
      {result?.error && <p className="mt-2 text-red-700">{result.error}</p>}
      {result?.link && (
        <p className="mt-2">
          {result.sent ? "Sent. If it doesn't arrive, use this link:" : "No email service configured yet - use this link:"}{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5">{result.link}</code>
        </p>
      )}
    </div>
  );
}
