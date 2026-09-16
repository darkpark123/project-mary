"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-notice-dismissed";

// ponytail: a notice, not a consent gate - we only set one strictly-necessary
// session cookie today, which doesn't legally require opt-in. Swap this for a
// real accept/reject gate before any analytics or ad cookie ships (see
// /legal/cookies "If advertising is added").
export default function CookieNotice() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable (private browsing, blocked storage) - show the notice.
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p>
          We use one strictly-necessary cookie to keep you signed in - no tracking or ad
          cookies yet.{" "}
          <Link href="/legal/cookies" className="text-teal-700 underline">
            Cookie Policy
          </Link>
        </p>
        <button
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, "1");
            } catch {
              // ignore - the notice will just reappear next visit
            }
            setDismissed(true);
          }}
          className="rounded-md bg-teal-700 px-3 py-1.5 text-white hover:bg-teal-800"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
