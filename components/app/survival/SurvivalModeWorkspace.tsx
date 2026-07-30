"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Loader2,
  RotateCcw,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { PersistedDashboardState } from "@/components/app/dashboard/types";
import { announcePlanningUpdate } from "@/lib/planning/client-sync";

export default function SurvivalModeWorkspace({
  initialState,
}: {
  initialState: PersistedDashboardState | null;
}) {
  const [state, setState] = useState(initialState);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const active = Boolean(state?.survivalMode?.active);
  const essentialTasks = (state?.tasks ?? []).slice(0, 2);

  async function updateMode(action: "survival-on" | "survival-off") {
    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json().catch(() => null)) as
        | { state?: PersistedDashboardState; error?: string }
        | null;

      if (!response.ok || !data?.state) {
        throw new Error(data?.error ?? "Could not update Survival Mode.");
      }

      window.localStorage.removeItem("maui-dashboard-state");
      setState(data.state);
      await refreshSharedPlan(data.state, action);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update Survival Mode."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function refreshSharedPlan(
    nextState: PersistedDashboardState,
    action: "survival-on" | "survival-off"
  ) {
    const context = nextState.currentContext;

    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          availableMinutes: action === "survival-on" ? 180 : 300,
          emotionState: context?.emotionState ?? "steady",
          burnoutRisk: context?.burnoutRisk ?? "low",
          energyLevel: action === "survival-on" ? "low" : "medium",
          tasks: nextState.tasks,
          todayNotes:
            action === "survival-on"
              ? "Survival Mode is active. Keep only essential work, add recovery, and postpone anything nonessential."
              : "Survival Mode ended. Reintroduce work only if it fits today’s capacity.",
          replanTrigger: action,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { state?: PersistedDashboardState; revision?: number }
        | null;

      if (response.ok && data?.state) {
        setState(data.state);
        announcePlanningUpdate(data.revision ?? Date.now());
      }
    } catch {
      // The capacity adjustment is already saved; Maui can replan on the next visit.
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-bg)]">
      <div className="app-page-wash pointer-events-none absolute inset-0" />
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
        <section className="app-card-strong overflow-hidden rounded-[28px] p-5 sm:rounded-[34px] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)]/48 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]">
                <Shield size={15} />
                {active ? "Survival Mode is on" : "A lower-pressure day"}
              </div>
              <h1 className="mt-5 text-[clamp(2.1rem,7vw,4.2rem)] font-bold leading-[0.96] tracking-[-0.055em]">
                {active ? "Only the essentials remain." : "Make today smaller."}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
                Survival Mode protects your original plan, shortens focus blocks, and
                surfaces only the two most useful next steps. Nothing is deleted.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[var(--color-accent)]/45 text-[var(--color-primary-deep)]">
              <HeartHandshake size={28} />
            </div>
          </div>

          {!state ? (
            <div className="app-subcard mt-7 rounded-[22px] p-5">
              <p className="font-semibold text-[var(--color-dark)]">
                Your task list is not ready yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Open the dashboard once so Maui can prepare a plan to simplify.
              </p>
              <Link
                href="/dashboard"
                className="maui-button-primary mt-4 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold"
              >
                Open dashboard <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Clock3,
                    title: "10-minute ceiling",
                    body: "Every focus block stays deliberately short.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Two essentials",
                    body: "The rest of the list waits without disappearing.",
                  },
                  {
                    icon: RotateCcw,
                    title: "Easy to restore",
                    body: "Return to your full plan whenever capacity returns.",
                  },
                ].map((item) => (
                  <article
                    key={item.title}
                    className="app-subcard rounded-[20px] p-4"
                  >
                    <item.icon
                      size={18}
                      className="text-[var(--color-primary-deep)]"
                    />
                    <h2 className="mt-3 text-base font-semibold">{item.title}</h2>
                    <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-secondary)]">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>

              {active ? (
                <section className="mt-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--color-text-secondary)]">
                    Enough for today
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {essentialTasks.length ? (
                      essentialTasks.map((task, index) => (
                        <article
                          key={task.id}
                          className="rounded-[22px] border border-[var(--color-primary)]/24 bg-[var(--color-accent)]/28 p-5"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-deep)]">
                            Step {index + 1} · {task.focusMinutes} min
                          </p>
                          <h2 className="mt-3 text-lg font-semibold leading-tight">
                            {task.title}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                            {task.steps[0] ?? "Open the task and do one visible action."}
                          </p>
                        </article>
                      ))
                    ) : (
                      <p className="app-subcard rounded-[22px] p-5 text-sm text-[var(--color-text-secondary)] sm:col-span-2">
                        There are no active tasks. Rest is a valid plan.
                      </p>
                    )}
                  </div>
                </section>
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="mt-5 rounded-2xl border border-[var(--color-error)]/25 px-4 py-3 text-sm text-[var(--color-error)]"
                >
                  {error}
                </p>
              ) : null}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    void updateMode(active ? "survival-off" : "survival-on")
                  }
                  disabled={isUpdating}
                  className="maui-button-primary inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-55"
                >
                  {isUpdating ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : active ? (
                    <RotateCcw size={17} />
                  ) : (
                    <Shield size={17} />
                  )}
                  {active ? "Restore full plan" : "Enter Survival Mode"}
                </button>
                <Link
                  href="/dashboard"
                  className="maui-button-secondary inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
                >
                  Go to dashboard <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
