"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => signup(formData),
    {}
  );

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
      <form action={formAction} className="mt-6 space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">I am a...</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="role" value="CLINICIAN" defaultChecked required />
            Medical professional
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="role" value="ORG_ADMIN" required />
            Church / sending organization
          </label>
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Name (or organization name)
          </label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
