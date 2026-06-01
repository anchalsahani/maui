"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Dumbbell,
  FileText,
  Home,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import type { TaskItem } from "@/components/app/dashboard/types";
import type { PlannerResult } from "@/lib/ai/types";
import type { AuthUser, GeneratedStudyTask, StudyProfile } from "@/lib/auth/types";

const studyExamples = [
  "B.Tech CSE",
  "UPSC",
  "NEET",
  "Class 12 PCM",
  "CA Foundation",
  "Self-learning Web Development",
];

export default function PersonalizationForm({
  initialProfile,
}: {
  initialProfile: StudyProfile | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentProfile, setCurrentProfile] = useState(initialProfile);
  const [aiPlan, setAiPlan] = useState<PlannerResult | null>(null);
  const [aiWarning, setAiWarning] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const taskPreview = useMemo(
    () => currentProfile?.generatedTasks ?? [],
    [currentProfile]
  );
  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");
    setAiWarning("");

    const response = await fetch("/api/profile/personalization", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string; user?: AuthUser }
      | null;

    if (!response.ok) {
      setError(data?.error ?? "Could not save personalization yet.");
      return;
    }

    const updatedProfile = data?.user?.studyProfile ?? currentProfile;

    setCurrentProfile(updatedProfile);
    setAiPlan(null);
    window.localStorage.removeItem("maui-dashboard-state");
    setSuccess("Personalization saved. Maui is building your day plan now.");
    router.refresh();

    if (updatedProfile) {
      await generateAiPlan(updatedProfile);
    }
  }

  async function generateAiPlan(profile: StudyProfile) {
    setIsPlanning(true);
    setAiWarning("");

    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availableMinutes: getAvailableMinutes(profile),
          emotionState: "steady",
          burnoutRisk: "low",
          todayNotes: buildTodayNotes(profile),
          tasks: buildTaskItems(profile),
        }),
      });
      const data = (await response.json()) as {
        plan?: PlannerResult;
        warning?: string;
        error?: string;
      };

      if (!response.ok || !data.plan) {
        throw new Error(data.error ?? "Planner failed.");
      }

      setAiPlan(data.plan);
      setAiWarning(data.warning ?? "");
      setSuccess(
        data.warning
          ? "Personalization saved. Local fallback made a day plan because AI planning was unavailable."
          : "Personalization saved. AI day plan generated."
      );
    } catch (error) {
      setAiWarning(error instanceof Error ? error.message : "Planner failed.");
      setSuccess("Personalization saved. Your dashboard will now use this roadmap.");
    } finally {
      setIsPlanning(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={(formData) => startTransition(() => void handleSubmit(formData))}
      className="space-y-6"
    >
      <input type="hidden" name="syllabusMode" value="paste" />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[30px] border border-white/50 bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/60 text-[var(--color-primary-deep)]">
              <FileText size={19} />
            </div>
            <div>
              <h2 className="text-[1.35rem] font-semibold text-[var(--color-dark)]">
                Whole-day profile
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Add everything that competes for your attention in a normal day.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--color-dark)]">
                What are you studying?
              </span>
              <input
                name="studying"
                defaultValue={currentProfile?.studying ?? ""}
                className="input"
                placeholder="B.Tech CSE, UPSC, NEET, Class 12 PCM..."
                disabled={isPending}
                required
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {studyExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    const input = formRef.current?.elements.namedItem("studying");
                    if (input instanceof HTMLInputElement) {
                      input.value = example;
                      input.focus();
                    }
                  }}
                  className="rounded-full border border-[var(--color-border)] bg-white/78 px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]/35 hover:text-[var(--color-dark)]"
                >
                  {example}
                </button>
              ))}
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--color-dark)]">
                Goal type
              </span>
              <select
                name="goal"
                defaultValue={currentProfile?.goal ?? "exam"}
                className="input"
                disabled={isPending}
              >
                <option value="exam">Exam preparation</option>
                <option value="course">Course completion</option>
                <option value="skill">Skill building</option>
                <option value="revision">Revision cycle</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--color-dark)]">
                Goals and preferences
              </span>
              <textarea
                name="preferences"
                defaultValue={currentProfile?.preferences ?? ""}
                className="input min-h-24 resize-y"
                placeholder="Wake/sleep time, best focus hours, deadlines, energy dips, preferred daily rhythm..."
                disabled={isPending}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--color-dark)]">
                Study, syllabus, or learning work
              </span>
              <textarea
                name="manualSyllabus"
                defaultValue={currentProfile?.manualSyllabus ?? ""}
                className="input min-h-48 resize-y"
                placeholder="Subjects, chapters, assignments, revision topics, projects, lectures, practice sets..."
                disabled={isPending}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-dark)]">
                  <CalendarClock size={16} />
                  Fixed commitments
                </span>
                <textarea
                  name="fixedCommitments"
                  defaultValue={currentProfile?.fixedCommitments ?? ""}
                  className="input min-h-36 resize-y"
                  placeholder="Classes, work shifts, appointments, tuition, calls, commute, deadlines with times..."
                  disabled={isPending}
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-dark)]">
                  <Home size={16} />
                  Chores and errands
                </span>
                <textarea
                  name="choresAndErrands"
                  defaultValue={currentProfile?.choresAndErrands ?? ""}
                  className="input min-h-36 resize-y"
                  placeholder="Cleaning, laundry, dishes, groceries, cooking, bills, room reset, family tasks..."
                  disabled={isPending}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-dark)]">
                  <Dumbbell size={16} />
                  Wellbeing, games, and rest
                </span>
                <textarea
                  name="wellbeingAndFun"
                  defaultValue={currentProfile?.wellbeingAndFun ?? ""}
                  className="input min-h-36 resize-y"
                  placeholder="Gym, meals, breaks, games, friends, hobbies, prayer, walk, sleep wind-down..."
                  disabled={isPending}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-dark)]">
                  Planning notes
                </span>
                <textarea
                  name="planningNotes"
                  defaultValue={currentProfile?.planningNotes ?? ""}
                  className="input min-h-36 resize-y"
                  placeholder="What usually derails you? What should Maui avoid? Any ADHD support rules that work for you?"
                  disabled={isPending}
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[30px] border border-white/50 bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/60 text-[var(--color-primary-deep)]">
                <Sparkles size={19} />
              </div>
              <div>
                <h2 className="text-[1.35rem] font-semibold text-[var(--color-dark)]">
                  Current details
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  This is what Maui uses to shape your roadmap.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/72 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  Studying
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-dark)]">
                  {currentProfile?.studying || "Not set yet"}
                </p>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/72 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  Topics
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-dark)]">
                  {taskPreview.length}
                </p>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/72 px-4 py-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  Last processed
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-dark)]">
                  {currentProfile?.lastProcessedAt
                    ? new Date(currentProfile.lastProcessedAt).toLocaleString()
                    : "No day plan generated yet"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-white/50 bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Parsed preview
            </p>
            <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-2">
              {taskPreview.length > 0 ? (
                taskPreview.map((task, index) => (
                  <div
                    key={task.id}
                    className="rounded-[20px] border border-[var(--color-border)] bg-white/74 px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/55 text-[11px] font-semibold text-[var(--color-primary-deep)]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="mb-2 inline-flex rounded-full bg-[var(--color-accent)]/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-deep)]">
                          {formatCategory(task.category)}
                        </span>
                        <p className="text-sm font-semibold leading-5 text-[var(--color-dark)]">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          {task.subject} - {task.estimatedMinutes} min - {formatPriority(task.priority)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-[var(--color-border)] bg-white/70 px-4 py-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                  No day details processed yet. Add study, chores, appointments, or routines, then regenerate the plan.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/50 bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  AI day plan
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Save and Maui will read the full profile, including planning notes.
                </p>
              </div>
              {isPlanning ? (
                <Loader2 className="shrink-0 animate-spin text-[var(--color-primary-deep)]" size={20} />
              ) : (
                <CheckCircle2 className="shrink-0 text-[var(--color-primary-deep)]" size={20} />
              )}
            </div>

            {aiWarning ? (
              <p className="mt-4 rounded-[18px] border border-[var(--color-border)] bg-white/72 p-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                {aiWarning}
              </p>
            ) : null}

            {aiPlan ? (
              <div className="mt-4 space-y-3">
                <h3 className="text-base font-semibold leading-5 text-[var(--color-dark)]">
                  {aiPlan.headline}
                </h3>
                {aiPlan.dayAtGlance.slice(0, 4).map((block, index) => (
                  <div
                    key={`${block.timeLabel}-${block.title}-${index}`}
                    className="rounded-[18px] border border-[var(--color-border)] bg-white/74 px-4 py-3"
                  >
                    <p className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-deep)]">
                      <Clock size={13} />
                      {block.timeLabel}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--color-dark)]">
                      {block.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                      {block.goal}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </aside>
      </div>

      <section className="flex flex-col gap-3 rounded-[28px] border border-white/50 bg-white/78 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-dark)]">
            Ready to update your day plan?
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Saving will refresh the dashboard task queue from your whole-day profile.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-primary-deep)] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Regenerating..." : "Save and regenerate day plan"}
          {isPending ? <RefreshCcw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </button>
      </section>

      {error ? (
        <p className="rounded-2xl border border-[var(--color-error)]/25 bg-[var(--color-error)]/8 px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-[var(--color-primary)]/25 bg-[var(--color-accent)]/45 px-4 py-3 text-sm text-[var(--color-primary-deep)]">
          <p>{success}</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-white/82 px-4 text-xs font-semibold text-[var(--color-dark)] transition hover:-translate-y-0.5 hover:bg-white"
          >
            Open dashboard and start working
          </Link>
        </div>
      ) : null}
    </form>
  );
}

function formatCategory(category: GeneratedStudyTask["category"]) {
  switch (category) {
    case "commitment":
      return "Fixed commitment";
    case "chore":
      return "Chore or errand";
    case "wellbeing":
      return "Wellbeing, games, rest";
    default:
      return "Study";
  }
}

function formatPriority(priority: GeneratedStudyTask["priority"]) {
  switch (priority) {
    case "high":
      return "High priority";
    case "low":
      return "Low priority";
    default:
      return "Medium priority";
  }
}

function getAvailableMinutes(profile: StudyProfile) {
  const text = `${profile.preferences} ${profile.planningNotes}`.toLowerCase();
  const match = text.match(/(\d{1,3})\s*(minutes|min|mins|hours|hrs|hr)/);

  if (!match) {
    return 90;
  }

  const amount = Number(match[1]);
  const isHours = match[2].startsWith("h");
  const minutes = isHours ? amount * 60 : amount;

  return Math.min(240, Math.max(15, minutes));
}

function buildTodayNotes(profile: StudyProfile) {
  return [
    `Studying: ${profile.studying}`,
    `Goal: ${profile.goal}`,
    profile.preferences ? `Goals and preferences:\n${profile.preferences}` : "",
    profile.fixedCommitments ? `Fixed commitments:\n${profile.fixedCommitments}` : "",
    profile.choresAndErrands ? `Chores and errands:\n${profile.choresAndErrands}` : "",
    profile.wellbeingAndFun ? `Wellbeing, games, and rest:\n${profile.wellbeingAndFun}` : "",
    profile.planningNotes ? `Planning notes:\n${profile.planningNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildTaskItems(profile: StudyProfile): TaskItem[] {
  return profile.generatedTasks
    .filter((task) => task.status !== "done")
    .map((task) => ({
      id: task.id,
      title: task.title,
      subject: task.subject,
      category: task.category,
      status: task.status,
      priority: task.priority,
      urgency: task.priority === "high" ? 9 : task.priority === "medium" ? 6 : 4,
      difficulty: task.difficulty === "hard" ? 7 : task.difficulty === "medium" ? 5 : 3,
      deadlineWeight: task.deadline ? 3 : 1,
      focusMinutes: Math.min(45, Math.max(15, task.estimatedMinutes)),
      progress: task.progress,
      deadline: task.deadline,
      recurrence: task.recurrence,
      steps: [
        `Open ${task.title}.`,
        "Do the smallest visible start.",
        "Stop and mark progress.",
      ],
    }));
}
