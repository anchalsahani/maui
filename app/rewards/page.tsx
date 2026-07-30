import { Award, CheckCircle2, Flame, Sparkles, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import PlanningProgressCard from "@/components/app/rewards/PlanningProgressCard";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getDashboardState } from "@/lib/dashboard/state-store";
import { getRewardSummary, listRewardEvents } from "@/lib/rewards/store";

export default async function RewardsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const events = await listRewardEvents(user.id);
  const summary = getRewardSummary(events);
  const weekly = getWeeklyInsight(events);
  const workspace = await getDashboardState(user.id);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-bg)]">
      <div className="app-page-wash pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute right-[-10%] top-[-8%] h-[480px] w-[480px] rounded-full bg-[var(--color-primary)]/10 blur-[78px]" />

      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-3 pb-10 pt-20 sm:px-6 sm:pb-14 sm:pt-24">
        <section className="app-card-strong rounded-[24px] p-4 sm:rounded-[32px] sm:p-8">
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

        <section className="app-card mt-5 grid gap-4 rounded-[24px] p-4 sm:mt-8 sm:grid-cols-[auto_1fr] sm:items-center sm:rounded-[32px] sm:p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--color-accent)]/48 text-[var(--color-primary-deep)]">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--color-primary-deep)]">
              This week · {weekly.activeDays} active day{weekly.activeDays === 1 ? "" : "s"}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{weekly.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              {weekly.body}
            </p>
          </div>
        </section>

        <PlanningProgressCard initialPlanning={workspace?.planning ?? null} />

        <section className="app-card mt-5 rounded-[24px] p-4 sm:mt-8 sm:rounded-[32px] sm:p-7">
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
                  className="app-subcard flex items-center justify-between gap-3 rounded-[18px] px-3 py-3 sm:rounded-[22px] sm:px-4"
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
              <div className="app-muted-card rounded-[24px] border-dashed px-5 py-8 text-center">
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
    <div className="app-subcard rounded-[20px] p-3 sm:rounded-[26px] sm:p-4">
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

function getWeeklyInsight(
  events: Array<{ createdAt: string; type: string }>
) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);
  const recentEvents = events.filter(
    (event) => new Date(event.createdAt).getTime() >= cutoff.getTime()
  );
  const activeDays = new Set(
    recentEvents.map((event) => event.createdAt.slice(0, 10))
  ).size;
  const microWins = recentEvents.filter(
    (event) => event.type === "micro_step"
  ).length;

  if (activeDays === 0) {
    return {
      activeDays,
      title: "A restart still counts.",
      body: "One tiny step today is enough to begin a new pattern.",
    };
  }

  if (activeDays <= 2) {
    return {
      activeDays,
      title: "You kept the thread alive.",
      body: `${microWins} micro win${microWins === 1 ? "" : "s"} made progress visible without asking for perfection.`,
    };
  }

  return {
    activeDays,
    title: "Consistency is becoming visible.",
    body: `You returned on ${activeDays} different days. Maui values returning more than perfect streaks.`,
  };
}
