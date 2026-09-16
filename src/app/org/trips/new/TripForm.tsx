"use client";

import { useState } from "react";
import { createTrip } from "@/app/actions";

type RoleNeed = { specialty: string; count: number; scopeOfPracticeNotes: string };

const inputCls = "mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm";
const labelCls = "block text-xs font-medium text-slate-600";

export default function TripForm() {
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [hostSiteName, setHostSiteName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [costToVolunteerUsd, setCost] = useState(0);
  const [malpracticeCovered, setMalpracticeCovered] = useState(false);
  const [hostRequested, setHostRequested] = useState(false);
  const [localPartnerNamed, setLocalPartnerNamed] = useState(false);
  const [continuityPlan, setContinuityPlan] = useState("");
  const [description, setDescription] = useState("");
  const [roleNeeds, setRoleNeeds] = useState<RoleNeed[]>([
    { specialty: "", count: 1, scopeOfPracticeNotes: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function updateRole(i: number, patch: Partial<RoleNeed>) {
    setRoleNeeds(roleNeeds.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await createTrip({
        country,
        region,
        hostSiteName,
        startDate,
        endDate,
        costToVolunteerUsd,
        malpracticeCovered,
        hostRequested,
        localPartnerNamed,
        continuityPlan,
        description,
        roleNeeds,
      });
      if (result?.error) setError(result.error);
      // no error and no throw means createTrip's redirect() fired - navigation
      // is already underway, nothing else to do here.
    } catch (err) {
      // redirect() throws a framework-internal signal Next.js intercepts
      // before it reaches here - only real failures land in this catch.
      if (!(err instanceof Error && err.message === "NEXT_REDIRECT")) {
        setError("Something went wrong posting this trip. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Country</label>
          <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Region</label>
          <input className={inputCls} value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Host site name</label>
          <input className={inputCls} value={hostSiteName} onChange={(e) => setHostSiteName(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Cost to volunteer (USD)</label>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={costToVolunteerUsd}
            onChange={(e) => setCost(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelCls}>Start date</label>
          <input
            type="date"
            className={inputCls}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>End date</label>
          <input
            type="date"
            className={inputCls}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={inputCls}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-700">Ethics &amp; trust (§5)</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hostRequested} onChange={(e) => setHostRequested(e.target.checked)} />
          Requested by the host site (not proposed by us)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={localPartnerNamed}
            onChange={(e) => setLocalPartnerNamed(e.target.checked)}
          />
          Named local clinical partner
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={malpracticeCovered}
            onChange={(e) => setMalpracticeCovered(e.target.checked)}
          />
          Malpractice coverage provided
        </label>
        <div>
          <label className={labelCls}>Continuity plan (records, follow-up)</label>
          <textarea
            className={inputCls}
            rows={2}
            value={continuityPlan}
            onChange={(e) => setContinuityPlan(e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-700">Roles needed</legend>
        {roleNeeds.map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-3">
              <input
                className={inputCls}
                placeholder="Specialty"
                value={r.specialty}
                onChange={(e) => updateRole(i, { specialty: e.target.value })}
                required
              />
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder="Count"
                value={r.count}
                onChange={(e) => updateRole(i, { count: Number(e.target.value) })}
              />
              <input
                className={inputCls}
                placeholder="Scope-of-practice notes"
                value={r.scopeOfPracticeNotes}
                onChange={(e) => updateRole(i, { scopeOfPracticeNotes: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => setRoleNeeds(roleNeeds.filter((_, j) => j !== i))}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRoleNeeds([...roleNeeds, { specialty: "", count: 1, scopeOfPracticeNotes: "" }])}
          className="text-sm text-teal-700 hover:underline"
        >
          + Add role
        </button>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-teal-700 px-5 py-2 text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post trip"}
      </button>
    </form>
  );
}
