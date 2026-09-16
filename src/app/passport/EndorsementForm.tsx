"use client";

import { useActionState } from "react";
import { requestEndorsement } from "@/app/actions";

type State = { error?: string; link?: string; sent?: boolean };

export default function EndorsementForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => requestEndorsement(formData),
    {}
  );

  return (
    <form action={formAction} className="grid gap-2 sm:grid-cols-2">
      <input
        name="endorserName"
        placeholder="Pastor's name"
        required
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
      <input
        name="endorserEmail"
        type="email"
        placeholder="Pastor's email"
        required
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
      <input
        name="church"
        placeholder="Church"
        required
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
      <input
        name="relationship"
        placeholder="Relationship (e.g. Senior Pastor)"
        required
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-teal-700 px-3 py-1.5 text-sm text-teal-700 hover:bg-teal-50 disabled:opacity-60"
        >
          {pending ? "Sending..." : "Request endorsement"}
        </button>
        {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
        {state?.link && (
          <p className="mt-2 text-sm text-slate-600">
            {state.sent ? (
              <>Sent to your pastor. If it doesn&apos;t arrive, here&apos;s the link to forward yourself:</>
            ) : (
              <>No email service is configured yet - send this confirmation link to your pastor yourself:</>
            )}{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5">{state.link}</code>
          </p>
        )}
      </div>
    </form>
  );
}
