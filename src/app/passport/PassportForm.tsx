"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";

type Credential = { licenseNumber: string; issuingBody: string; country: string; specialty: string };
type Capability = { name: string; lowResourceCompetent: boolean };
type Language = { language: string; proficiency: string };
type Availability = { startDate: string; endDate: string; flexible: boolean };
type ServiceRecord = { tripName: string; role: string; startDate: string; endDate: string; leaderReference: string };

export type PassportData = {
  fullName: string;
  specialty: string;
  yearsInPractice: number;
  bio: string;
  willingToLead: boolean;
  regionPrefs: string;
  tripLengthPrefDays: number | null;
  backgroundCheckStatus: string;
  credentials: Credential[];
  capabilities: Capability[];
  languages: Language[];
  availability: Availability[];
  serviceRecords: ServiceRecord[];
};

// Generic "list of rows" editor - every repeatable section (credentials,
// capabilities, languages, ...) is the same shape, so one component covers
// all of them instead of five near-identical ones.
function RowEditor<T>({
  rows,
  onChange,
  empty,
  renderRow,
  addLabel,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  empty: T;
  renderRow: (row: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="flex items-start gap-2 rounded-md border border-slate-200 p-3">
          <div className="flex-1">
            {renderRow(row, (patch) =>
              onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            className="text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, empty])}
        className="text-sm text-teal-700 hover:underline"
      >
        + {addLabel}
      </button>
    </div>
  );
}

const inputCls = "mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm";
const labelCls = "block text-xs font-medium text-slate-600";

export default function PassportForm({ initial }: { initial: PassportData }) {
  const [data, setData] = useState<PassportData>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateProfile(data);
      if (result?.error) setError(result.error);
      else setSaved(true);
    } catch {
      setError("Something went wrong saving your Passport. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Identity</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Full name</label>
            <input
              className={inputCls}
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Primary specialty</label>
            <input
              className={inputCls}
              value={data.specialty}
              onChange={(e) => setData({ ...data, specialty: e.target.value })}
              placeholder="e.g. Anesthesiology"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Years in practice</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={data.yearsInPractice}
              onChange={(e) => setData({ ...data, yearsInPractice: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelCls}>Preferred trip length (days)</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={data.tripLengthPrefDays ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  tripLengthPrefDays: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Bio</label>
          <textarea
            className={inputCls}
            rows={3}
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Preferred regions (comma-separated)</label>
            <input
              className={inputCls}
              value={data.regionPrefs}
              onChange={(e) => setData({ ...data, regionPrefs: e.target.value })}
              placeholder="East Africa, Central America"
            />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.willingToLead}
              onChange={(e) => setData({ ...data, willingToLead: e.target.checked })}
            />
            Willing to lead a trip
          </label>
          <div>
            <label className={labelCls}>Background check status</label>
            <select
              className={inputCls}
              value={data.backgroundCheckStatus}
              onChange={(e) => setData({ ...data, backgroundCheckStatus: e.target.value })}
            >
              <option value="NOT_STARTED">Not started</option>
              <option value="PENDING">Pending</option>
              <option value="CLEARED">Cleared</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Self-reported. Upload supporting evidence under Documents below.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Credentials</h2>
        <RowEditor<Credential>
          rows={data.credentials}
          onChange={(credentials) => setData({ ...data, credentials })}
          empty={{ licenseNumber: "", issuingBody: "", country: "", specialty: "" }}
          addLabel="Add credential"
          renderRow={(row, update) => (
            <div className="grid gap-2 sm:grid-cols-4">
              <input
                className={inputCls}
                placeholder="License #"
                value={row.licenseNumber}
                onChange={(e) => update({ licenseNumber: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Issuing body"
                value={row.issuingBody}
                onChange={(e) => update({ issuingBody: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Country"
                value={row.country}
                onChange={(e) => update({ country: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Specialty"
                value={row.specialty}
                onChange={(e) => update({ specialty: e.target.value })}
              />
            </div>
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Capabilities</h2>
        <RowEditor<Capability>
          rows={data.capabilities}
          onChange={(capabilities) => setData({ ...data, capabilities })}
          empty={{ name: "", lowResourceCompetent: false }}
          addLabel="Add capability"
          renderRow={(row, update) => (
            <div className="flex flex-wrap items-center gap-3">
              <input
                className={inputCls + " flex-1"}
                placeholder="Procedure or skill"
                value={row.name}
                onChange={(e) => update({ name: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.lowResourceCompetent}
                  onChange={(e) => update({ lowResourceCompetent: e.target.checked })}
                />
                Low-resource competent
              </label>
            </div>
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Languages</h2>
        <RowEditor<Language>
          rows={data.languages}
          onChange={(languages) => setData({ ...data, languages })}
          empty={{ language: "", proficiency: "CONVERSATIONAL" }}
          addLabel="Add language"
          renderRow={(row, update) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className={inputCls}
                placeholder="Language"
                value={row.language}
                onChange={(e) => update({ language: e.target.value })}
              />
              <select
                className={inputCls}
                value={row.proficiency}
                onChange={(e) => update({ proficiency: e.target.value })}
              >
                <option value="BASIC">Basic</option>
                <option value="CONVERSATIONAL">Conversational</option>
                <option value="FLUENT">Fluent</option>
                <option value="NATIVE">Native</option>
              </select>
            </div>
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
        <RowEditor<Availability>
          rows={data.availability}
          onChange={(availability) => setData({ ...data, availability })}
          empty={{ startDate: "", endDate: "", flexible: false }}
          addLabel="Add availability window"
          renderRow={(row, update) => (
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                className={inputCls}
                value={row.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
                required
              />
              <span className="text-sm text-slate-500">to</span>
              <input
                type="date"
                className={inputCls}
                value={row.endDate}
                onChange={(e) => update({ endDate: e.target.value })}
                required
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.flexible}
                  onChange={(e) => update({ flexible: e.target.checked })}
                />
                Flexible
              </label>
            </div>
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Service history</h2>
        <RowEditor<ServiceRecord>
          rows={data.serviceRecords}
          onChange={(serviceRecords) => setData({ ...data, serviceRecords })}
          empty={{ tripName: "", role: "", startDate: "", endDate: "", leaderReference: "" }}
          addLabel="Add past trip"
          renderRow={(row, update) => (
            <div className="grid gap-2 sm:grid-cols-5">
              <input
                className={inputCls}
                placeholder="Trip / org name"
                value={row.tripName}
                onChange={(e) => update({ tripName: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Role"
                value={row.role}
                onChange={(e) => update({ role: e.target.value })}
              />
              <input
                type="date"
                className={inputCls}
                value={row.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
                required
              />
              <input
                type="date"
                className={inputCls}
                value={row.endDate}
                onChange={(e) => update({ endDate: e.target.value })}
                required
              />
              <input
                className={inputCls}
                placeholder="Leader reference"
                value={row.leaderReference}
                onChange={(e) => update({ leaderReference: e.target.value })}
              />
            </div>
          )}
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-teal-700">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-teal-700 px-5 py-2 text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Passport"}
      </button>
    </form>
  );
}
