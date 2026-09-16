import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions";
import Footer from "@/components/Footer";
import CookieNotice from "@/components/CookieNotice";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Mary",
  description: "Connecting Christian medical professionals to the mission field.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <header className="border-b border-slate-200">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-teal-800">
              Project Mary
            </Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/trips" className="text-slate-600 hover:text-slate-900">
                Trips
              </Link>
              {session?.user?.role === "CLINICIAN" && (
                <Link href="/passport" className="text-slate-600 hover:text-slate-900">
                  My Passport
                </Link>
              )}
              {session?.user?.role === "ORG_ADMIN" && (
                <Link href="/org/trips" className="text-slate-600 hover:text-slate-900">
                  My Trips
                </Link>
              )}
              {session?.user ? (
                <form action={logout}>
                  <button className="text-slate-600 hover:text-slate-900">Sign out</button>
                </form>
              ) : (
                <>
                  <Link href="/login" className="text-slate-600 hover:text-slate-900">
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-teal-700 px-3 py-1.5 text-white hover:bg-teal-800"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <Footer />
        <CookieNotice />
      </body>
    </html>
  );
}
