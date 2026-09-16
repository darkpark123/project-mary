import Link from "next/link";
import { verifyEmail } from "@/app/actions";

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await verifyEmail(token);

  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Email verification</h1>
      {result.error ? (
        <p className="rounded-md bg-red-50 p-3 text-red-700">{result.error}</p>
      ) : (
        <p className="rounded-md bg-teal-50 p-3 text-teal-800">Your email is verified.</p>
      )}
      <Link href="/" className="inline-block text-sm text-teal-700 underline">
        Continue to Project Mary
      </Link>
    </div>
  );
}
