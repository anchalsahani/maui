import { Award, CheckCircle2, Flame, Sparkles, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getRewardSummary, listRewardEvents } from "@/lib/rewards/store";

export default async function RewardsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const events = await listRewardEvents(user.id);
  const summary = getRewardSummary(events);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(207,232,213,0.72),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,250,250,0.96))]" />
      <div className="pointer-events-none absolute right-[-10%] top-[-8%] h-[560px] w-[560px] rounded-full bg-[var(--color-primary)]/12 blur-[120px]" />

      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-3 pb-10 pt-20 sm:px-6 sm:pb-14 sm:pt-24">
        <section className="rounded-[24px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(242,250,244,0.84))] p-4 shadow-[0_28px_80px_rgba(53,85,63,0.1)] backdrop-blur-2xl sm:rounded-[32px] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Rewards
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2rem,12vw,4.4rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[var(--color-dark)] sm:tracking-[-0.06em]">
            Your small wins are being counted.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--color-text-secondary)] sm:text-[16px]">
            Maui tracks focus sessions, micro steps, and completed broken-down tasks so progress feels visible.
          </p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 md:grid-cols-4 md:gap-4">
          <RewardStat label="Total points" value={summary.totalPoints} icon={Trophy} />
          <RewardStat label="Daily streak" value={summary.streak} icon={Flame} />
          <RewardStat
            label="Sessions"
            value={summary.sessionsCompleted}
            icon={CheckCircle2}
          />
          <RewardStat
            label="Micro wins"
            value={summary.microTasksCompleted}
            icon={Sparkles}
          />
        </section>

        <section className="mt-5 rounded-[24px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] p-4 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl sm:mt-8 sm:rounded-[32px] sm:p-7">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                Reward history
              </p>
              <h2 className="mt-3 text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--color-dark)]">
                Recent momentum
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/48 text-[var(--color-primary-deep)]">
              <Award size={20} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {events.length > 0 ? (
              events.slice(0, 12).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-[18px] border border-white/45 bg-white/76 px-3 py-3 shadow-[0_10px_28px_rgba(53,85,63,0.05)] sm:rounded-[22px] sm:px-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-dark)]">
                      {getEventLabel(event.type)}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">
                      {event.title} · {formatRewardDate(event.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--color-accent)]/55 px-3 py-1 text-sm font-semibold text-[var(--color-primary-deep)]">
                    +{event.points}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--color-border-strong)] bg-white/58 px-5 py-8 text-center">
                <p className="text-sm font-semibold text-[var(--color-dark)]">
                  No reward events yet.
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Complete a focus session or a micro step on the dashboard and it will show up here.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function RewardStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[20px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(247,250,248,0.78))] p-3 shadow-[0_18px_55px_rgba(53,85,63,0.08)] sm:rounded-[26px] sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/48 text-[var(--color-primary-deep)]">
          <Icon size={18} />
        </div>
        <p className="text-[1.2rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)] sm:text-[1.45rem]">
          {value}
        </p>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)] sm:mt-4 sm:text-xs sm:tracking-[0.18em]">
        {label}
      </p>
    </div>
  );
}

function getEventLabel(type: string) {
  switch (type) {
    case "focus_session":
      return "Focus session completed";
    case "broken_down_task":
      return "Broken-down task finished";
    default:
      return "Micro step completed";
  }
}

function formatRewardDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
