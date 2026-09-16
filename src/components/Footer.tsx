import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-8 text-sm text-slate-500">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4">
        <p>
          &copy; {new Date().getFullYear()} {SITE_NAME}
        </p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/legal/terms" className="hover:text-slate-700">
            Terms
          </Link>
          <Link href="/legal/privacy" className="hover:text-slate-700">
            Privacy
          </Link>
          <Link href="/legal/cookies" className="hover:text-slate-700">
            Cookies
          </Link>
          <Link href="/legal/accessibility" className="hover:text-slate-700">
            Accessibility
          </Link>
          <Link href="/contact" className="hover:text-slate-700">
            Contact
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-slate-700">
            {CONTACT_EMAIL}
          </a>
        </nav>
      </div>
    </footer>
  );
}
