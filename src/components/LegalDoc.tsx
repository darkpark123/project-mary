// ponytail: `prose` needs @tailwindcss/typography, which isn't installed -
// four legal pages don't justify pulling in a plugin. Plain arbitrary-variant
// utilities style the same tags with no extra dependency.
const CLASSES =
  "max-w-2xl space-y-1 " +
  "[&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 " +
  "[&_p]:mt-2 [&_p]:text-slate-700 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-slate-700 " +
  "[&_a]:text-teal-700 [&_a]:underline [&_table]:mt-2 [&_table]:w-full [&_table]:text-left [&_table]:text-sm " +
  "[&_th]:border-b [&_th]:border-slate-300 [&_th]:pb-1 [&_th]:pr-4 [&_td]:border-b [&_td]:border-slate-100 [&_td]:py-1 [&_td]:pr-4";

export default function LegalDoc({ children }: { children: React.ReactNode }) {
  return <div className={CLASSES}>{children}</div>;
}
