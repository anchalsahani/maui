import Link from "next/link";

import { appPages } from "@/lib/app-pages";
import { getAuthenticatedUser } from "@/lib/auth/session";
import Button from "../ui/Button";
import UserMenu from "./UserMenu";

export default async function Navbar() {
  const user = await getAuthenticatedUser();

  return (
    <header className="fixed inset-x-0 top-2 z-50 px-3 sm:top-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 rounded-full border border-white/20 bg-white/55 px-3 py-2 shadow-[0_8px_32px_rgba(16,47,21,0.06)] backdrop-blur-2xl sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
          <span className="text-[1.12rem] font-semibold tracking-[-0.04em] text-[var(--color-dark)] sm:text-[1.25rem]">
            Maui
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link href={appPages[0].href} className="hidden sm:block">
                <Button variant="primary" className="px-0 text-sm">Dashboard</Button>
              </Link>

              <UserMenu userName={user.name} />
            </>
          ) : (
            <Link href="/signup">
              <Button variant="primary" className="px-0">Check in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
