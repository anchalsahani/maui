import { redirect } from "next/navigation";
import { ArrowRight, Palette, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-dvh bg-[var(--color-bg)]">
      <div className="app-page-wash pointer-events-none absolute inset-0" />
      <div className="relative z-50">
        <Navbar />
      </div>
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
        <section className="app-card-strong rounded-[28px] p-5 sm:rounded-[34px] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
            Settings
          </p>
          <h1 className="mt-3 text-[clamp(2rem,7vw,3.8rem)] font-bold leading-[0.98]">
            Keep Maui comfortable.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
            Change the environment or revisit how Maui supports your work.
          </p>

          <div className="mt-7 grid gap-3">
            <div className="app-subcard flex items-center justify-between gap-4 rounded-[22px] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Palette
                  size={19}
                  className="mt-0.5 text-[var(--color-primary-deep)]"
                />
                <div>
                  <h2 className="text-base font-semibold">Appearance</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Switch between dark and light. Your choice persists everywhere.
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <SettingsLink
              href="/personalization#support-preferences"
              icon={SlidersHorizontal}
              title="Personalization"
              description="Update support preferences, studies, commitments, and planning context."
            />
          </div>

          <div className="mt-7 border-t border-[var(--color-border)] pt-5">
            <p className="text-xs text-[var(--color-text-secondary)]">
              Signed in as
            </p>
            <p className="mt-1 text-sm font-semibold">{user.email}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function SettingsLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Palette;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="app-subcard group flex items-center justify-between gap-4 rounded-[22px] p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Icon size={19} className="mt-0.5 text-[var(--color-primary-deep)]" />
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
      </div>
      <ArrowRight
        size={17}
        className="shrink-0 text-[var(--color-primary-deep)] transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
