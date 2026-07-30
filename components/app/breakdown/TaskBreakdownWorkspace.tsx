"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  ListTree,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  PersistedDashboardState,
  TaskItem,
} from "@/components/app/dashboard/types";
import type { TaskBreakdownResult } from "@/lib/ai/types";
import { announcePlanningUpdate } from "@/lib/planning/client-sync";

export default function TaskBreakdownWorkspace() {
  const [taskText, setTaskText] = useState("");
  const [result, setResult] = useState<TaskBreakdownResult | null>(null);
  const [task, setTask] = useState<TaskItem | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const completeCount = useMemo(
    () =>
      result?.microSteps.filter((step) => completed.includes(step)).length ?? 0,
    [completed, result]
  );

  async function generateBreakdown() {
    const title = taskText.trim();

    if (!title) {
      return;
    }

    const nextTask: TaskItem = {
      id: `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      subject: "Personal",
      category: "study",
      status: "todo",
      priority: "medium",
      urgency: 6,
      difficulty: 5,
      deadlineWeight: 1,
      focusMinutes: 15,
      steps: [],
    };

    setIsGenerating(true);
    setError("");
    setResult(null);
    setCompleted([]);
    setSaved(false);

    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: nextTask,
          emotionState: "overwhelmed",
          burnoutRisk: "medium",
          recentMoments: ["The user pasted this because it feels difficult to start."],
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { breakdown?: TaskBreakdownResult; warning?: string; error?: string }
        | null;

      if (!response.ok || !data?.breakdown) {
        throw new Error(data?.error ?? "Could not break this task down.");
      }

      const preparedTask = {
        ...nextTask,
        steps: data.breakdown.microSteps,
      };
      setTask(preparedTask);
      setResult(data.breakdown);
      setError(data.warning ?? "");
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Could not break this task down."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveTask() {
    if (!task) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-task", tasks: [task] }),
      });
      const data = (await response.json().catch(() => null)) as
        | { state?: PersistedDashboardState; error?: string }
        | null;

      if (!response.ok || !data?.state) {
        throw new Error(data?.error ?? "Could not add this task.");
      }

      window.localStorage.removeItem("maui-dashboard-state");
      setSaved(true);
      await refreshSharedPlan(data.state);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not add this task."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function refreshSharedPlan(state: PersistedDashboardState | undefined) {
    if (!state) {
      return;
    }

    try {
      const context = state.currentContext;
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          availableMinutes: 300,
          tasks: state.tasks,
          emotionState: context?.emotionState ?? "steady",
          burnoutRisk: context?.burnoutRisk ?? "low",
          energyLevel:
            context?.emotionState === "tired" || context?.emotionState === "overwhelmed"
              ? "low"
              : "medium",
          todayNotes: "A newly broken-down task was added. Decide whether it belongs in today’s capacity or should wait.",
          replanTrigger: "task_added",
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { revision?: number }
        | null;

      if (response.ok) {
        announcePlanningUpdate(data?.revision ?? Date.now());
      }
    } catch {
      // The task is already saved. The planner will include it on the next refresh.
    }
  }

  return (
    <div className="relative min-h-dvh bg-[var(--color-bg)]">
      <div className="app-page-wash pointer-events-none absolute inset-0" />
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
        <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="app-card-strong h-fit rounded-[28px] p-5 sm:rounded-[34px] sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/48 text-[var(--color-primary-deep)]">
              <ListTree size={20} />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
              AI Task Breakdown
            </p>
            <h1 className="mt-2 text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[0.98]">
              Paste the overwhelming version.
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              Maui will turn it into visible actions. A rough sentence is enough.
            </p>

            <label htmlFor="task-to-break-down" className="sr-only">
              Task to break down
            </label>
            <textarea
              id="task-to-break-down"
              value={taskText}
              onChange={(event) => setTaskText(event.target.value)}
              maxLength={500}
              className="input mt-5 min-h-32 resize-y"
              placeholder="Example: Finish my research paper before Friday…"
            />
            <button
              type="button"
              onClick={() => void generateBreakdown()}
              disabled={!taskText.trim() || isGenerating}
              className="maui-button-primary mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Sparkles size={17} />
              )}
              {isGenerating ? "Making it startable…" : "Break it down"}
            </button>
          </div>

          <section
            className="app-card min-h-[440px] rounded-[28px] p-5 sm:rounded-[34px] sm:p-7"
            aria-live="polite"
          >
            {result ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                      Startable roadmap
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight">
                      {result.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[var(--color-accent)]/42 px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
                    {completeCount}/{result.microSteps.length}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {result.contextNote}
                </p>

                <div className="mt-6 space-y-2.5">
                  {result.microSteps.map((step, index) => {
                    const done = completed.includes(step);

                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() =>
                          setCompleted((current) =>
                            done
                              ? current.filter((item) => item !== step)
                              : [...current, step]
                          )
                        }
                        className={`flex w-full items-start gap-3 rounded-[18px] border p-3.5 text-left transition-colors duration-200 ${
                          done
                            ? "border-[var(--color-primary)]/25 bg-[var(--color-accent)]/32"
                            : "border-[var(--color-border)] bg-[var(--color-card-soft)] hover:bg-[var(--color-card-hover)]"
                        }`}
                      >
                        <span className="mt-0.5 text-[var(--color-primary-deep)]">
                          {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </span>
                        <span>
                          <span className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-text-secondary)]">
                            Step {index + 1}
                          </span>
                          <span
                            className={`mt-1 block text-sm font-medium leading-6 ${
                              done ? "line-through opacity-60" : ""
                            }`}
                          >
                            {step}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void saveTask()}
                    disabled={isSaving || saved}
                    className="maui-button-primary inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : saved ? (
                      <Check size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                    {saved ? "Added to dashboard" : "Add to dashboard"}
                  </button>
                  <Link
                    href="/dashboard"
                    className="maui-button-secondary inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold"
                  >
                    Open dashboard <ArrowRight size={16} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex min-h-[390px] items-center justify-center text-center">
                <div className="max-w-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--color-accent)]/35 text-[var(--color-primary-deep)]">
                    <ListTree size={24} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold">
                    One step will appear at a time.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    No planning required. Paste the task and let Maui expose the hidden
                    starting points.
                  </p>
                </div>
              </div>
            )}

            {error ? (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
              >
                {error}
              </p>
            ) : null}
          </section>
        </section>
      </main>
    </div>
  );
}
