import Link from "next/link";

// ponytail: a styled placeholder, not an ad network integration - there's no
// inventory to serve yet. Swap the inner content for a real ad tag (e.g.
// Google Ad Manager/AdSense) once a network or direct sponsor is signed; see
// /contact#advertise for how sponsors reach us.
export default function AdSlot({ label = "Sponsored" }: { label?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
      <p className="font-medium text-slate-400">{label} placement available</p>
      <p className="mt-1">
        Reach Christian medical volunteers.{" "}
        <Link href="/contact#advertise" className="text-teal-700 underline">
          Advertise here
        </Link>
      </p>
    </div>
  );
}
