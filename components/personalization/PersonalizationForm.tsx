"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowRight,
  Brain,
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
import type {
  AuthUser,
  GeneratedStudyTask,
  StudyProfile,
  UserSurvey,
} from "@/lib/auth/types";

const studyExamples = [
  "B.Tech CSE",
  "UPSC",
  "NEET",
  "Class 12 PCM",
  "CA Foundation",
  "Self-learning Web Development",
];

const surveyGroups = [
  {
    key: "focusWindow",
    title: "What kind of focus window usually feels safest?",
    options: [
      { value: "short", label: "Short", description: "5 to 15 minute pushes" },
      { value: "medium", label: "Medium", description: "15 to 30 minute sessions" },
      { value: "flexible", label: "Flexible", description: "Adjust based on the day" },
    ],
  },
  {
    key: "taskPace",
    title: "How should Maui break your work down?",
    options: [
      { value: "tiny", label: "Tiny steps", description: "Very small, low-friction actions" },
      { value: "balanced", label: "Balanced", description: "A few clear steps at a time" },
      { value: "deep", label: "Deeper blocks", description: "Fewer, more substantial chunks" },
    ],
  },
  {
    key: "overwhelmTrigger",
    title: "Where do you get stuck most often?",
    options: [
      { value: "starting", label: "Starting", description: "Beginning is the hardest part" },
      { value: "planning", label: "Planning", description: "Structuring feels overwhelming" },
      { value: "finishing", label: "Finishing", description: "I start, but don't wrap up" },
      { value: "switching", label: "Switching", description: "Context changes break momentum" },
    ],
  },
  {
    key: "supportStyle",
    title: "What tone should Maui use with you?",
    options: [
      { value: "gentle", label: "Gentle", description: "Soft, low-pressure guidance" },
      { value: "direct", label: "Direct", description: "Clear and practical prompts" },
      { value: "encouraging", label: "Encouraging", description: "Warm motivation and reassurance" },
    ],
  },
  {
    key: "energyPattern",
    title: "How does your energy usually behave?",
    options: [
      { value: "steady", label: "Steady", description: "Mostly stable once I begin" },
      { value: "waves", label: "Waves", description: "Good and bad bursts through the day" },
      { value: "low", label: "Low", description: "I often start already drained" },
    ],
  },
] as const;

const defaultSurvey: UserSurvey = {
  focusWindow: "short",
  taskPace: "tiny",
  overwhelmTrigger: "starting",
  supportStyle: "gentle",
  energyPattern: "waves",
};

const processingSteps = [
  { key: "survey", label: "Focus style saved" },
  { key: "profile", label: "Whole-day profile processed" },
  { key: "roadmap", label: "Roadmap tasks generated" },
  { key: "dashboard", label: "Dashboard prepared" },
] as const;

type ProcessingStepKey = (typeof processingSteps)[number]["key"];

interface ProcessingState {
  active: boolean;
  step: ProcessingStepKey;
  completed: ProcessingStepKey[];
  summary: {
    studying: string;
    topics: number;
    tasks: number;
  } | null;
}

const initialProcessingState: ProcessingState = {
  active: false,
  step: "survey",
  completed: [],
  summary: null,
};

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export default function PersonalizationForm({
  initialProfile,
  initialSurvey,
  redirectToDashboardOnSave = false,
}: {
  initialProfile: StudyProfile | null;
  initialSurvey: UserSurvey | null;
  redirectToDashboardOnSave?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentProfile, setCurrentProfile] = useState(initialProfile);
  const [survey, setSurvey] = useState<UserSurvey>(initialSurvey ?? defaultSurvey);
  const [aiPlan, setAiPlan] = useState<PlannerResult | null>(null);
  const [aiWarning, setAiWarning] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>(initialProcessingState);
  const formRef = useRef<HTMLFormElement>(null);
  const isBusy = isPending || isPlanning || processing.active;

  const taskPreview = useMemo(
    () => currentProfile?.generatedTasks ?? [],
    [currentProfile]
  );
  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");
    setAiWarning("");
    setProcessing({
      ...initialProcessingState,
      active: true,
    });

    const onboardingResponse = await fetch("/api/profile/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(survey),
    });

    const onboardingData = (await onboardingResponse.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!onboardingResponse.ok) {
      setError(onboardingData?.error ?? "Could not save your setup answers yet.");
      setProcessing(initialProcessingState);
      return;
    }

    setProcessing((current) => ({
      ...current,
      step: "profile",
      completed: ["survey"],
    }));

    const syllabusFile = formData.get("syllabusFile");
    const hasUpload = syllabusFile instanceof File && syllabusFile.size > 0;
    formData.set("syllabusMode", hasUpload ? "upload" : "paste");

    const response = await fetch("/api/profile/personalization", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string; user?: AuthUser }
      | null;

    if (!response.ok) {
      setError(data?.error ?? "Could not save personalization yet.");
      setProcessing(initialProcessingState);
      return;
    }

    const updatedProfile = data?.user?.studyProfile ?? currentProfile;

    setCurrentProfile(updatedProfile);
    setAiPlan(null);
    window.localStorage.removeItem("maui-dashboard-state");
    setProcessing({
      active: true,
      step: "roadmap",
      completed: ["survey", "profile"],
      summary: updatedProfile
        ? {
            studying: updatedProfile.studying,
            topics: updatedProfile.topics.length,
            tasks: updatedProfile.generatedTasks.length,
          }
        : null,
    });
    setSuccess("Personalization saved. Maui is building your day plan now.");
    router.refresh();

    if (updatedProfile) {
      await generateAiPlan(updatedProfile);
    }

    setProcessing((current) => ({
      ...current,
      step: "dashboard",
      completed: ["survey", "profile", "roadmap"],
    }));
    await delay(450);

    setProcessing((current) => ({
      ...current,
      completed: ["survey", "profile", "roadmap", "dashboard"],
    }));
    await delay(250);

    if (redirectToDashboardOnSave) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setProcessing(initialProcessingState);
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
      className="space-y-5 sm:space-y-6"
    >
      <input type="hidden" name="syllabusMode" value="paste" />

      <section className="rounded-[22px] border border-white/50 bg-white/78 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:rounded-[30px] sm:p-6">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/60 text-[var(--color-primary-deep)]">
            <Brain size={19} />
          </div>
          <div>
            <h2 className="text-[1.35rem] font-semibold text-[var(--color-dark)]">
              Focus setup
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              These answers shape task size, session length, and support tone.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {surveyGroups.map((group) => (
            <div key={group.key}>
              <p className="text-sm font-semibold text-[var(--color-dark)]">
                {group.title}
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.options.map((option) => {
                  const selected = survey[group.key] === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setSurvey((current) => ({
                          ...current,
                          [group.key]: option.value,
                        }))
                      }
                      disabled={isBusy}
                    className={`rounded-[16px] border px-3.5 py-3 text-left transition-all duration-200 sm:rounded-[20px] sm:px-4 ${
                        selected
                          ? "border-[var(--color-primary)]/45 bg-[var(--color-accent)]/45 shadow-[0_12px_24px_rgba(53,85,63,0.08)]"
                          : "border-[var(--color-border)] bg-white/78 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/28 hover:bg-white"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      <span className="text-sm font-semibold text-[var(--color-dark)]">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--color-text-secondary)]">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[22px] border border-white/50 bg-white/78 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:rounded-[30px] sm:p-6">
          <div className="flex items-start gap-3 sm:items-center">
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
                disabled={isBusy}
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
                disabled={isBusy}
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
                disabled={isBusy}
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
                disabled={isBusy}
              />
            </label>

            <label className="flex min-h-32 cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-[var(--color-primary)]/35 bg-white/62 px-4 py-4 text-sm text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--color-dark)]">
                Upload syllabus or plan
              </span>
              <span className="mt-1">PDF, DOC, DOCX, or TXT</span>
              <input
                name="syllabusFile"
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="mt-3 max-w-full text-xs"
                disabled={isBusy}
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
                  disabled={isBusy}
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
                  disabled={isBusy}
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
                  disabled={isBusy}
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
                  disabled={isBusy}
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[22px] border border-white/50 bg-white/78 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:rounded-[30px] sm:p-6">
            <div className="flex items-start gap-3 sm:items-center">
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

          <section className="rounded-[22px] border border-white/50 bg-white/78 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:rounded-[30px] sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Parsed preview
            </p>
            <div className="mt-4 max-h-[430px] space-y-3 overflow-y-auto pr-1 sm:max-h-[520px] sm:pr-2">
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

          <section className="rounded-[22px] border border-white/50 bg-white/78 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:rounded-[30px] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

      <section className="flex flex-col gap-3 rounded-[22px] border border-white/50 bg-white/78 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:rounded-[28px]">
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
          disabled={isBusy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-primary-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:px-6 sm:py-0"
        >
          {isBusy ? "Processing..." : "Save and regenerate day plan"}
          {isBusy ? <RefreshCcw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
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

      {processing.active ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--color-dark)]/28 px-3 py-4 backdrop-blur-sm">
          <section className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[24px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,250,246,0.98))] p-4 shadow-[0_30px_100px_rgba(16,47,21,0.22)] sm:rounded-[30px] sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)]/70 text-[var(--color-primary-deep)]">
                <Loader2 size={22} className="animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  Building your Maui flow
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight text-[var(--color-dark)]">
                  {redirectToDashboardOnSave
                    ? "Processing your setup before the dashboard opens."
                    : "Processing your setup and refreshing your dashboard plan."}
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {processingSteps.map((item) => {
                const isComplete = processing.completed.includes(item.key);
                const isActive = processing.step === item.key && !isComplete;

                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 rounded-[20px] border px-4 py-3 ${
                      isComplete
                        ? "border-[var(--color-primary)]/25 bg-[var(--color-accent)]/42"
                        : isActive
                          ? "border-[var(--color-primary)]/35 bg-white/88"
                          : "border-[var(--color-border)] bg-white/56"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/84 text-[var(--color-primary-deep)]">
                      {isComplete ? (
                        <CheckCircle2 size={17} />
                      ) : isActive ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-[var(--color-border-strong)]" />
                      )}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-dark)]">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {processing.summary ? (
              <div className="mt-5 grid gap-3 rounded-[22px] border border-[var(--color-border)] bg-white/70 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                    Profile
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-[var(--color-dark)]">
                    {processing.summary.studying}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                    Topics
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-dark)]">
                    {processing.summary.topics}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                    Tasks
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-dark)]">
                    {processing.summary.tasks}
                  </p>
                </div>
              </div>
            ) : null}
          </section>
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
