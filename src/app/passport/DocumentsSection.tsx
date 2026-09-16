"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument, removeDocument } from "@/app/actions";

type Doc = { id: string; kind: string; label: string; originalFilename: string };

const inputCls = "rounded-md border border-slate-300 px-2 py-1.5 text-sm";

export default function DocumentsSection({ documents }: { documents: Doc[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      const result = await uploadDocument(formData);
      if (!result?.error) router.refresh();
      return result;
    },
    {}
  );

  return (
    <section className="space-y-3 border-t border-slate-200 pt-8">
      <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
      <p className="text-sm text-slate-600">
        License scans and background-check evidence, encrypted before storage and reviewed manually
        as part of verification. PDF, JPG, or PNG, up to 10MB.
      </p>

      {documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-2 text-sm"
            >
              <span>
                <span className="font-medium">{d.kind === "LICENSE" ? "License" : "Background check"}</span>
                {d.label && ` - ${d.label}`}
                <span className="text-slate-500"> · {d.originalFilename}</span>
              </span>
              <span className="flex items-center gap-3">
                <a href={`/api/documents/${d.id}`} className="text-teal-700 underline">
                  Download
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await removeDocument(d.id);
                    if (result?.error) alert(result.error);
                    else router.refresh();
                  }}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <select name="kind" className={inputCls} defaultValue="LICENSE">
          <option value="LICENSE">License scan</option>
          <option value="BACKGROUND_CHECK">Background check</option>
        </select>
        <input name="label" placeholder="Label (e.g. Uganda license)" className={inputCls} />
        <input
          type="file"
          name="file"
          accept="application/pdf,image/jpeg,image/png"
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-teal-700 px-3 py-1.5 text-sm text-teal-700 hover:bg-teal-50 disabled:opacity-60"
        >
          {pending ? "Uploading..." : "Upload"}
        </button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </section>
  );
}
