"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Clock,
  HeartPulse,
  Loader2,
  Moon,
  Sparkles,
} from "lucide-react";

import type { TaskItem } from "@/components/app/dashboard/types";
import type { PlannerResult } from "@/lib/ai/types";
import type { StudyProfile, UserSurvey } from "@/lib/auth/types";

interface PlannerWorkspaceProps {
  userId: string;
  survey: UserSurvey;
  studyProfile: StudyProfile | null;
}

type MoodKey = "clear" | "hopeful" | "tired" | "stuck" | "overwhelmed";

interface MoodOption {
  key: MoodKey;
  label: string;
  body: string;
  energy: "steady" | "tired" | "overwhelmed";
  minutes: number;
}

interface MoodEntry {
  id: string;
  mood: MoodKey;
  label: string;
  note: string;
  createdAt: string;
}

const HISTORY_KEY_PREFIX = "maui-mood-history";

const moodOptions: MoodOption[] = [
  {
    key: "clear",
    label: "Clear",
    body: "Start the best available task.",
    energy: "steady",
    minutes: 60,
  },
  {
    key: "hopeful",
    label: "Hopeful",
    body: "Use the momentum, gently.",
    energy: "steady",
    minutes: 45,
  },
  {
    key: "tired",
    label: "Tired",
    body: "Shrink the plan to one useful thing.",
    energy: "tired",
    minutes: 25,
  },
  {
    key: "stuck",
    label: "Stuck",
    body: "Pick the least impossible doorway.",
    energy: "overwhelmed",
    minutes: 15,
  },
  {
    key: "overwhelmed",
    label: "Overwhelmed",
    body: "Protect energy before productivity.",
    energy: "overwhelmed",
    minutes: 10,
  },
];

export default function PlannerWorkspace({
  userId,
  survey,
  studyProfile,
}: PlannerWorkspaceProps) {
  const defaultMood = survey.energyPattern === "low" ? "tired" : "hopeful";
  const historyKey = `${HISTORY_KEY_PREFIX}:${userId}`;
  const [selectedMood, setSelectedMood] = useState<MoodKey>(defaultMood);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<MoodEntry[]>(() => readStoredHistory(historyKey));
  const [plan, setPlan] = useState<PlannerResult | null>(null);
  const [warning, setWarning] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  const tasks = useMemo(() => buildTaskItems(studyProfile), [studyProfile]);
  const mood = moodOptions.find((option) => option.key === selectedMood) ?? moodOptions[1];
  const visibleBlocks = plan?.dayAtGlance.slice(0, 3) ?? [];
  const nextTask = tasks[0];

  function saveHistoryEntry(entry: MoodEntry) {
    setHistory((current) => {
      const next = [entry, ...current].slice(0, 8);
      window.localStorage.setItem(historyKey, JSON.stringify(next));
      return next;
    });
  }

  async function generatePlan() {
    setIsPlanning(true);
    setWarning("");

    const draftEntry: MoodEntry = {
      id: `${Date.now()}-${selectedMood}`,
      mood: selectedMood,
      label: mood.label,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availableMinutes: mood.minutes,
          emotionState: mood.energy,
          burnoutRisk:
            mood.energy === "overwhelmed"
              ? "high"
              : mood.energy === "tired"
                ? "medium"
                : "low",
          rantContext: buildHistoryContext(history, draftEntry),
          todayNotes: buildTodayNotes({ mood, note, studyProfile, nextTask }),
          tasks,
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

      const detectedMood = mapEmotionToMood(data.plan.situation.emotionalState);
      const correctedEntry: MoodEntry = {
        ...draftEntry,
        id: `${draftEntry.id}-${data.plan.situation.emotionalState}`,
        mood: detectedMood,
        label: formatEmotionLabel(data.plan.situation.emotionalState),
      };

      setSelectedMood(detectedMood);
      saveHistoryEntry(correctedEntry);
      setPlan(data.plan);
      setWarning(data.warning ?? "");
    } catch (error) {
      saveHistoryEntry(normalizeHistoryEntry(draftEntry));
      setWarning(error instanceof Error ? error.message : "Planner failed.");
    } finally {
      setIsPlanning(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(207,232,213,0.78),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,250,250,0.96))]" />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 pt-24 sm:px-6">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/50 bg-white/78 p-6 shadow-[var(--shadow-soft)] backdrop-blur-2xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-deep)]">
                <HeartPulse size={17} />
                Mood Check-In
              </div>
              <h1 className="mt-4 max-w-2xl text-[clamp(2.1rem,5vw,3.45rem)] font-bold leading-[0.95] text-[var(--color-dark)]">
                How have you been feeling recently?
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
                A low-friction ADHD support space for messy days, competing demands,
                and the &quot;I do not know what to do&quot; spiral.
              </p>
            </div>

            <section className="rounded-[30px] border border-white/50 bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/60 text-[var(--color-primary-deep)]">
                  <Brain size={19} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-dark)]">
                    What is true right now?
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    One sentence is enough.
                  </p>
                </div>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={600}
                className="input mt-5 min-h-32 resize-y"
                placeholder="Example: I want to study, but every option feels like too much."
              />
              <div className="mt-4 rounded-[22px] border border-[var(--color-border)] bg-white/66 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  Next useful option
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--color-dark)]">
                  {nextTask?.title ?? "Add tasks in Personalization when you are ready."}
                </p>
              </div>

              <button
                type="button"
                onClick={generatePlan}
                disabled={isPlanning || tasks.length === 0}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-dark)] text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isPlanning ? <Loader2 className="animate-spin" size={17} /> : <Sparkles size={17} />}
                Give me one gentle plan
              </button>

              {warning ? (
                <p className="mt-4 rounded-[18px] border border-[var(--color-border)] bg-white/78 p-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {warning}
                </p>
              ) : null}
            </section>
          </div>

          <section className="rounded-[30px] border border-white/50 bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-dark)]">
                  Emotional history
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Recent check-ins, kept short.
                </p>
              </div>
              <Moon size={19} className="text-[var(--color-primary-deep)]" />
            </div>

            <div className="mt-5 space-y-3">
              {history.length > 0 ? (
                history.map((entry) => (
                  <article
                    key={entry.id}
                    className={`rounded-[20px] border px-4 py-3 ${getMoodHistoryClass(entry.mood)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[var(--color-dark)]">
                        {entry.label}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {formatTime(entry.createdAt)}
                      </span>
                    </div>
                    {entry.note ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--color-text-secondary)]">
                        {entry.note}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="rounded-[20px] border border-dashed border-[var(--color-border)] bg-white/62 px-4 py-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Your next check-in will appear here.
                </p>
              )}
            </div>
          </section>
        </section>

        <section className="mt-6">
          <div className="rounded-[30px] border border-white/50 bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  Support result
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight text-[var(--color-dark)]">
                  {plan?.headline ?? "A smaller next step will appear here."}
                </h2>
              </div>
              <span className="rounded-full bg-[var(--color-accent)]/65 px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
                {mood.minutes} min max
              </span>
            </div>

            {plan ? (
              <div className="mt-5 space-y-4">
                <SituationSummary plan={plan} />

                <p className="rounded-[22px] bg-[var(--color-accent)]/34 p-4 text-sm leading-6 text-[var(--color-dark)]">
                  {plan.framing}
                </p>

                <div className="grid gap-3">
                  {visibleBlocks.map((block, index) => (
                    <article
                      key={`${block.timeLabel}-${block.title}-${index}`}
                      className="rounded-[22px] border border-[var(--color-border)] bg-white/76 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
                          <Clock size={13} />
                          {block.timeLabel}
                        </span>
                        <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold leading-tight text-[var(--color-dark)]">
                        {block.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        {block.goal}
                      </p>
                      <p className="mt-3 rounded-[16px] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-dark)]">
                        {block.actions[0] ?? block.adhdNote}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniSupport title="If you freeze" items={plan.emergencyProtocol.slice(0, 2)} />
                  <MiniSupport title="Enough for today" items={plan.realisticOutcome.slice(0, 2)} />
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[22px] border border-dashed border-[var(--color-border)] bg-white/62 p-6 text-sm leading-6 text-[var(--color-text-secondary)]">
                Choose a feeling, write one line if you want, then ask for a gentle plan.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function MiniSupport({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-white/72 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-dark)]">
        <CheckCircle2 size={15} />
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p
            key={item}
            className="rounded-[14px] bg-[var(--color-bg)] px-3 py-2 text-sm leading-5 text-[var(--color-text-secondary)]"
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function SituationSummary({ plan }: { plan: PlannerResult }) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white/74 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Emotion
          </p>
          <p className="mt-1 text-sm font-semibold capitalize text-[var(--color-dark)]">
            {plan.situation.emotionalState}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Pressure
          </p>
          <p className="mt-1 text-sm font-semibold capitalize text-[var(--color-dark)]">
            {plan.situation.timePressure}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Strategy
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-dark)]">
            {formatStrategy(plan.situation.strategyType)}
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-[18px] bg-[var(--color-bg)] px-3 py-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        {plan.situation.emotionReason}
      </p>

      <div className="mt-4 grid gap-2">
        {plan.situation.detectedObligations.slice(0, 4).map((obligation) => (
          <div
            key={obligation.id}
            className="flex items-start justify-between gap-3 rounded-[16px] bg-white/82 px-3 py-2"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--color-dark)]">
                {obligation.label}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-secondary)]">
                {obligation.whyItMatters}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--color-accent)]/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-deep)]">
              {obligation.urgency}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {plan.situation.parallelOptions.slice(0, 2).map((option) => (
          <div
            key={option.label}
            className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-3"
          >
            <p className="text-sm font-semibold text-[var(--color-dark)]">
              {option.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
              {option.firstAction}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-[18px] bg-[var(--color-accent)]/34 px-3 py-2 text-sm font-semibold leading-6 text-[var(--color-primary-deep)]">
        Enough for today: {plan.situation.enoughForToday}
      </p>
    </div>
  );
}

function formatStrategy(strategy: PlannerResult["situation"]["strategyType"]) {
  switch (strategy) {
    case "alternating_loops":
      return "Alternating loops";
    case "deadline_triage":
      return "Deadline triage";
    case "burnout_protection":
      return "Burnout protection";
    case "interruption_reentry":
      return "Re-entry plan";
    default:
      return "Parallel options";
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function readStoredHistory(historyKey: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(historyKey);
    const parsed = stored ? (JSON.parse(stored) as MoodEntry[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 8).map(normalizeHistoryEntry) : [];
  } catch {
    return [];
  }
}

function normalizeHistoryEntry(entry: MoodEntry): MoodEntry {
  const correctedMood = detectMoodFromNote(entry.note);

  if (!correctedMood) {
    return entry;
  }

  return {
    ...entry,
    mood: correctedMood,
    label: moodOptions.find((option) => option.key === correctedMood)?.label ?? entry.label,
  };
}

function detectMoodFromNote(note: string): MoodKey | null {
  const text = note.toLowerCase();

  if (
    /\b(idk|i don't know|dont know|what to do|can't choose|cant choose|confused|stuck|freeze|frozen|too much|overwhelmed|really hard|hard to complete)\b/.test(
      text
    )
  ) {
    return "overwhelmed";
  }

  if (/\b(tired|drained|exhausted|sleepy|low energy)\b/.test(text)) {
    return "tired";
  }

  if (/\b(hopeful|motivated|ready)\b/.test(text)) {
    return "hopeful";
  }

  return null;
}

function mapEmotionToMood(emotion: PlannerResult["situation"]["emotionalState"]): MoodKey {
  switch (emotion) {
    case "overwhelmed":
      return "overwhelmed";
    case "stressed":
      return "stuck";
    case "tired":
      return "tired";
    case "hopeful":
      return "hopeful";
    default:
      return "clear";
  }
}

function formatEmotionLabel(emotion: PlannerResult["situation"]["emotionalState"]) {
  switch (emotion) {
    case "overwhelmed":
      return "Overwhelmed";
    case "stressed":
      return "Stressed";
    case "tired":
      return "Tired";
    case "hopeful":
      return "Hopeful";
    default:
      return "Clear";
  }
}
function getMoodHistoryClass(mood: MoodKey) {
  switch (mood) {
    case "clear":
      return "border-emerald-200 bg-emerald-50";
    case "hopeful":
      return "border-sky-200 bg-sky-50";
    case "tired":
      return "border-amber-200 bg-amber-50";
    case "stuck":
      return "border-orange-200 bg-orange-50";
    case "overwhelmed":
      return "border-rose-200 bg-rose-50";
    default:
      return "border-[var(--color-border)] bg-white";
  }
}

function buildTodayNotes({
  mood,
  note,
  studyProfile,
  nextTask,
}: {
  mood: MoodOption;
  note: string;
  studyProfile: StudyProfile | null;
  nextTask: TaskItem | undefined;
}) {
  return [
    `Current emotional fig: ${mood.label}`,
    `Support need: ${mood.body}`,
    note.trim() ? `User note: ${note.trim()}` : "",
    studyProfile?.planningNotes ? `Existing support notes: ${studyProfile.planningNotes}` : "",
    nextTask ? `Likely next task: ${nextTask.title}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildHistoryContext(history: MoodEntry[], currentEntry: MoodEntry) {
  return [currentEntry, ...history]
    .slice(0, 6)
    .map((entry) => {
      const note = entry.note ? `: ${entry.note}` : "";
      return `${entry.label}${note}`;
    })
    .join("\n");
}

function buildTaskItems(studyProfile: StudyProfile | null): TaskItem[] {
  return (
    studyProfile?.generatedTasks
      .filter((task) => task.status !== "done")
      .slice(0, 12)
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
        focusMinutes: Math.min(45, Math.max(10, task.estimatedMinutes)),
        progress: task.progress,
        deadline: task.deadline,
        recurrence: task.recurrence,
        steps: [
          `Open ${task.title}.`,
          "Do the smallest visible start.",
          "Stop and mark what changed.",
        ],
      })) ?? []
  );
}
