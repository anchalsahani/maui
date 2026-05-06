import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Button from "../ui/Button";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-3 left-35 z-50 px-6">

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/20 bg-white/30 px-6 py-4 shadow-[0_8px_32px_rgba(16,47,21,0.06)] backdrop-blur-2xl">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">

          <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />

          <span className="text-[1.25rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
            Maui
          </span>

        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Login */}
          <Link href="/login">

            <button className="flex h-[46px] items-center justify-center rounded-full px-5 text-[15px] font-medium text-[var(--color-dark)] transition-all duration-300 hover:bg-white/40">

              Login

            </button>

          </Link>

          {/* CTA */}
            <Link href="/signup">
              <Button variant="primary">
                 Sign up
              </Button>
            </Link>
        </div>
      </div>
    </header>
  );
}