import { redirect } from "next/navigation";

import PersonalizationForm from "@/components/personalization/PersonalizationForm";
import Navbar from "@/components/layout/Navbar";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function PersonalizationPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <div className="relative z-50">
        <Navbar />
      </div>
      <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] px-4 pb-14 pt-28 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(207,232,213,0.72),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.6),rgba(250,250,250,0.96))]" />
        <div className="relative mx-auto max-w-7xl">
          <section className="mb-7 rounded-[34px] border border-white/45 bg-white/76 p-6 shadow-[var(--shadow-card)] backdrop-blur-2xl sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Personalization
            </p>
            <h4 className="mt-3 max-w-3xl text-[clamp(2.0rem,5vw,2.6rem)] font-bold leading-[0.95] text-[var(--color-dark)]">
              A journal that does not just listen, but provides solutions too.
            </h4>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--color-text-secondary)]">
              Add your studies, chores, appointments, errands, rest, games, and daily constraints.
              Maui turns the messy truth of your day into a realistic ADHD-aware plan.
            </p>
          </section>

          <PersonalizationForm initialProfile={user.studyProfile} />
        </div>
      </main>
    </>
  );
}
