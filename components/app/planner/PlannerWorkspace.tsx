"use client";

import {
  BatteryLow,
  Brain,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Coffee,
  Gauge,
  History,
  Lightbulb,
  Loader2,
  Moon,
  Pause,
  Sparkles,
  Target,
  TimerReset,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import type { TaskItem } from "@/components/app/dashboard/types";
import type {
  PlannerResult,
  PlannerScheduleBlock,
} from "@/lib/ai/types";
import type { StudyProfile, UserSurvey } from "@/lib/auth/types";
import { announcePlanningUpdate } from "@/lib/planning/client-sync";

interface PlannerWorkspaceProps {
  userId: string;
  survey: UserSurvey;
  studyProfile: StudyProfile | null;
  initialTasks: TaskItem[];
  initialPlan: PlannerResult | null;
}

type MoodKey = "clear" | "hopeful" | "tired" | "stressed" | "overwhelmed";
type EnergyLevel = "low" | "medium" | "high";

interface MoodEntry {
  id: string;
  mood: MoodKey;
  label: string;
  note: string;
  createdAt: string;
}

const HISTORY_KEY_PREFIX = "maui-mood-history";

const moodOptions: Array<{
  key: MoodKey;
  label: string;
  emotion: "steady" | "hopeful" | "tired" | "stressed" | "overwhelmed";
}> = [
  { key: "clear", label: "Clear", emotion: "steady" },
  { key: "hopeful", label: "Hopeful", emotion: "hopeful" },
  { key: "tired", label: "Tired", emotion: "tired" },
  { key: "stressed", label: "Stressed", emotion: "stressed" },
  { key: "overwhelmed", label: "Overwhelmed", emotion: "overwhelmed" },
];

const horizonOptions = [
  { minutes: 180, label: "Next 3 hours" },
  { minutes: 300, label: "Next 5 hours" },
  { minutes: 480, label: "Rest of day" },
];

export default function PlannerWorkspace({
  userId,
  survey,
  studyProfile,
  initialTasks,
  initialPlan,
}: PlannerWorkspaceProps) {
  const defaultMood: MoodKey =
    survey.energyPattern === "low" ? "tired" : "clear";
  const historyKey = `${HISTORY_KEY_PREFIX}:${userId}`;
  const [selectedMood, setSelectedMood] = useState<MoodKey>(defaultMood);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(
    survey.energyPattern === "low" ? "low" : "medium"
  );
  const [availableMinutes, setAvailableMinutes] = useState(300);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<MoodEntry[]>(() =>
    readStoredHistory(historyKey)
  );
  const [plan, setPlan] = useState<PlannerResult | null>(initialPlan);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState("");

  const tasks = useMemo(
    () => mergeTaskItems(initialTasks, buildTaskItems(studyProfile)),
    [initialTasks, studyProfile]
  );
  const mood =
    moodOptions.find((option) => option.key === selectedMood) ?? moodOptions[0];
  const urgentCount = tasks.filter(
    (task) => task.priority === "high" || task.deadlineWeight >= 3
  ).length;
  const emotionalSummary = getLiveEmotionalSummary(
    selectedMood,
    energyLevel,
    note
  );

  async function generatePlan() {
    setIsPlanning(true);
    setError("");

    const entry: MoodEntry = {
      id: `${Date.now()}-${selectedMood}`,
      mood: selectedMood,
      label: mood.label,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          availableMinutes,
          energyLevel,
          emotionState: mood.emotion,
          burnoutRisk:
            selectedMood === "overwhelmed"
              ? "high"
              : selectedMood === "tired" || selectedMood === "stressed"
                ? "medium"
                : "low",
          rantContext: buildHistoryContext(history, entry),
          todayNotes: buildTodayContext({
            note,
            studyProfile,
            energyLevel,
            availableMinutes,
          }),
          tasks,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { plan?: PlannerResult; revision?: number; error?: string }
        | null;

      if (!response.ok || !data?.plan) {
        throw new Error("Maui could not refresh your day plan.");
      }

      setPlan(data.plan);
      announcePlanningUpdate(data.revision ?? Date.now());
      setHistory((current) => {
        const next = [entry, ...current].slice(0, 10);
        window.localStorage.setItem(historyKey, JSON.stringify(next));
        return next;
      });
    } catch {
      setError(
        "Maui could not refresh the schedule right now. Your previous plan is still available."
      );
    } finally {
      setIsPlanning(false);
    }
  }

  return (
    <div className="relative min-h-dvh bg-[var(--color-bg)]">
      <div className="app-page-wash pointer-events-none absolute inset-0" />

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-3 pb-12 pt-20 sm:px-6 sm:pt-24">
        <header className="app-card-strong rounded-[24px] p-5 sm:rounded-[32px] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
                <Sparkles size={15} />
                AI Planner
              </div>
              <h1 className="mt-4 text-[clamp(2.25rem,7vw,5rem)] font-bold leading-[0.94] tracking-[-0.06em]">
                A day shaped around your actual capacity.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
                Maui weighs deadlines, energy, commitments, progress, and emotional
                load—then decides what deserves time and what can wait.
              </p>
            </div>

            {plan ? (
              <div className="app-subcard grid min-w-[280px] grid-cols-2 gap-3 rounded-[22px] p-4">
                <SummaryMetric
                  label="Planning window"
                  value={`${Math.round(plan.planningWindow.totalAvailableMinutes / 60)}h`}
                />
                <SummaryMetric
                  label="Scheduled blocks"
                  value={String(plan.schedule.length)}
                />
              </div>
            ) : null}
          </div>
        </header>

        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.65fr)]">
          <section className="min-w-0 space-y-5">
            {plan ? (
              <>
                <section className="app-card-strong rounded-[24px] p-5 sm:rounded-[32px] sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                        Today&apos;s strategy
                      </p>
                      <h2 className="mt-2 text-[clamp(1.6rem,4vw,2.5rem)] font-semibold leading-tight">
                        {plan.headline}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                        {plan.strategy}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-[var(--color-accent)]/45 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]">
                      Focus: {plan.todayFocus}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <InsightCard
                      icon={Brain}
                      label="Capacity read"
                      body={plan.assessment.capacitySummary}
                    />
                    <InsightCard
                      icon={Target}
                      label="Key trade-off"
                      body={plan.assessment.keyTradeoff}
                    />
                  </div>
                </section>

                <section
                  className="app-card rounded-[24px] p-4 sm:rounded-[32px] sm:p-7"
                  aria-labelledby="today-plan-heading"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
                        Timeline
                      </p>
                      <h2
                        id="today-plan-heading"
                        className="mt-2 text-2xl font-semibold"
                      >
                        Today&apos;s plan
                      </h2>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {formatTime(plan.planningWindow.startTime)}–{formatTime(plan.planningWindow.endTime)}
                    </p>
                  </div>

                  <div className="relative mt-6">
                    <div className="absolute bottom-5 left-[15px] top-5 w-px bg-[var(--color-border-strong)] sm:left-[19px]" />
                    <div className="space-y-4">
                      {plan.schedule.map((block, index) => (
                        <TimelineBlock
                          key={block.id}
                          block={block}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                  <div className="app-card rounded-[24px] p-5 sm:rounded-[28px] sm:p-6">
                    <div className="flex items-center gap-2">
                      <Gauge
                        size={18}
                        className="text-[var(--color-primary-deep)]"
                      />
                      <h2 className="text-lg font-semibold">Energy forecast</h2>
                    </div>
                    <div className="mt-4 space-y-3">
                      {plan.energyForecast.map((forecast) => (
                        <div
                          key={forecast.period}
                          className="app-subcard rounded-[18px] p-3.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">
                              {forecast.period}
                            </p>
                            <EnergyBadge level={forecast.level} />
                          </div>
                          <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                            {forecast.guidance}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="app-card rounded-[24px] p-5 sm:rounded-[28px] sm:p-6">
                    <div className="flex items-center gap-2">
                      <Pause
                        size={18}
                        className="text-[var(--color-primary-deep)]"
                      />
                      <h2 className="text-lg font-semibold">
                        Deliberately postponed
                      </h2>
                    </div>
                    <div className="mt-4 space-y-3">
                      {plan.postponed.length ? (
                        plan.postponed.slice(0, 4).map((item) => (
                          <div
                            key={`${item.taskId}-${item.title}`}
                            className="app-subcard rounded-[18px] p-3.5"
                          >
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-secondary)]">
                              {item.reason}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-[var(--color-primary-deep)]">
                              {item.revisit}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="app-muted-card rounded-[18px] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                          Nothing needs an explicit postponement in this planning window.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="app-card flex flex-col gap-4 rounded-[24px] p-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[28px]">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold">Reassessment rule</p>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {plan.reassessment}
                    </p>
                  </div>
                  <div className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)]/48 px-5 text-sm font-semibold text-[var(--color-primary-deep)]">
                    <CheckCircle2 size={17} />
                    Synced across Maui
                  </div>
                </section>
              </>
            ) : (
              <EmptyPlan tasks={tasks} />
            )}
          </section>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="app-card-strong rounded-[24px] p-5 sm:rounded-[30px] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/48 text-[var(--color-primary-deep)]">
                  <Brain size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Mood check-in</h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Enough context to plan intelligently
                  </p>
                </div>
              </div>

              <fieldset className="mt-5">
                <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  How do you feel?
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {moodOptions.map((option) => (
                    <label
                      key={option.key}
                      className={`cursor-pointer rounded-[16px] border px-3 py-2.5 text-center text-xs font-semibold transition-colors duration-200 ${
                        selectedMood === option.key
                          ? "border-[var(--color-primary)] bg-[var(--color-accent)]/42 text-[var(--color-dark)]"
                          : "border-[var(--color-border)] bg-[var(--color-card-soft)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="planner-mood"
                        value={option.key}
                        checked={selectedMood === option.key}
                        onChange={() => {
                          setSelectedMood(option.key);
                          if (
                            option.key === "tired" ||
                            option.key === "overwhelmed"
                          ) {
                            setEnergyLevel("low");
                          }
                        }}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  Energy available
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((level) => (
                    <label
                      key={level}
                      className={`cursor-pointer rounded-[15px] border px-2 py-2.5 text-center text-xs font-semibold capitalize transition-colors duration-200 ${
                        energyLevel === level
                          ? "border-[var(--color-primary)] bg-[var(--color-accent)]/42"
                          : "border-[var(--color-border)] bg-[var(--color-card-soft)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="planner-energy"
                        checked={energyLevel === level}
                        onChange={() => setEnergyLevel(level)}
                        className="sr-only"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  Plan for
                </legend>
                <div className="mt-3 grid gap-2">
                  {horizonOptions.map((option) => (
                    <label
                      key={option.minutes}
                      className={`flex cursor-pointer items-center justify-between rounded-[15px] border px-3 py-2.5 text-xs font-semibold transition-colors duration-200 ${
                        availableMinutes === option.minutes
                          ? "border-[var(--color-primary)] bg-[var(--color-accent)]/42"
                          : "border-[var(--color-border)] bg-[var(--color-card-soft)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="planning-window"
                        checked={availableMinutes === option.minutes}
                        onChange={() => setAvailableMinutes(option.minutes)}
                        className="sr-only"
                      />
                      {option.label}
                      <Clock3 size={14} aria-hidden="true" />
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="mt-5 block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  What should Maui know?
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={1200}
                  className="input mt-3 min-h-28 resize-y"
                  placeholder="Deadlines, appointments, poor sleep, interruptions, or anything competing for attention…"
                />
              </label>

              <button
                type="button"
                onClick={() => void generatePlan()}
                disabled={isPlanning}
                className="maui-button-primary mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
              >
                {isPlanning ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Sparkles size={17} />
                )}
                {isPlanning
                  ? "Reasoning through your day…"
                  : plan
                    ? "Replan my day"
                    : "Plan my day"}
              </button>

              {error ? (
                <p
                  role="status"
                  className="mt-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-card-soft)] p-3 text-xs leading-5 text-[var(--color-text-secondary)]"
                >
                  {error}
                </p>
              ) : null}
            </section>

            <section className="app-card rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <Lightbulb
                  size={17}
                  className="text-[var(--color-primary-deep)]"
                />
                <h2 className="text-base font-semibold">Current read</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                {emotionalSummary}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <QuickMetric label="Tasks" value={String(tasks.length)} />
                <QuickMetric label="Urgent" value={String(urgentCount)} />
                <QuickMetric
                  label="Window"
                  value={`${Math.round(availableMinutes / 60)}h`}
                />
              </div>
            </section>
          </aside>
        </div>

        <section className="app-card mt-5 rounded-[24px] p-5 sm:rounded-[30px] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <History
                size={18}
                className="text-[var(--color-primary-deep)]"
              />
              <div>
                <h2 className="text-lg font-semibold">Emotional history</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Context, not a scorecard
                </p>
              </div>
            </div>
            <Moon
              size={18}
              className="text-[var(--color-primary-deep)]"
            />
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {history.length ? (
              history.map((entry) => (
                <article
                  key={entry.id}
                  className="app-subcard min-w-[220px] max-w-[280px] rounded-[18px] p-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{entry.label}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      {formatHistoryTime(entry.createdAt)}
                    </p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                    {entry.note || "No extra context added."}
                  </p>
                </article>
              ))
            ) : (
              <p className="app-muted-card w-full rounded-[18px] p-4 text-sm text-[var(--color-text-secondary)]">
                Your first planning check-in will appear here.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function TimelineBlock({
  block,
  index,
}: {
  block: PlannerScheduleBlock;
  index: number;
}) {
  const visual = getBlockVisual(block.type);
  const Icon = visual.icon;

  return (
    <article className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
      <div
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border sm:h-10 sm:w-10 ${visual.marker}`}
      >
        <Icon size={16} aria-hidden="true" />
      </div>
      <div
        className={`rounded-[20px] border p-4 sm:rounded-[24px] sm:p-5 ${visual.card}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--color-primary-deep)]">
                {formatTime(block.startTime)}–{formatTime(block.endTime)}
              </span>
              <span className="rounded-full bg-[var(--color-card-muted)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                {block.durationMinutes} min
              </span>
              <span className="rounded-full bg-[var(--color-card-muted)] px-2.5 py-1 text-[10px] font-semibold capitalize text-[var(--color-text-secondary)]">
                {block.priority} priority
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-tight">
              {block.title}
            </h3>
          </div>
          <EnergyBadge level={block.energy} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[16px] bg-[var(--color-card-muted)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
              Why this block
            </p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--color-dark)]/80">
              {block.reason}
            </p>
          </div>
          <div className="rounded-[16px] bg-[var(--color-card-muted)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
              Expected outcome
            </p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--color-dark)]/80">
              {block.expectedOutcome}
            </p>
          </div>
        </div>

        {block.conditional ? (
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[var(--color-text-secondary)]">
            <TimerReset
              size={14}
              className="mt-0.5 shrink-0 text-[var(--color-primary-deep)]"
            />
            {block.conditional}
          </p>
        ) : null}
        <span className="sr-only">Schedule block {index + 1}</span>
      </div>
    </article>
  );
}

function EmptyPlan({ tasks }: { tasks: TaskItem[] }) {
  return (
    <section className="app-card-strong flex min-h-[620px] items-center justify-center rounded-[24px] p-6 text-center sm:rounded-[32px]">
      <div className="max-w-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-accent)]/42 text-[var(--color-primary-deep)]">
          <CalendarClock size={28} />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
          Today is not a checklist
        </p>
        <h2 className="mt-3 text-[clamp(1.8rem,5vw,3rem)] font-semibold leading-tight">
          Maui will make the trade-offs for you.
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
          Choose your mood, energy, and planning window. Maui will decide which
          work deserves your best attention, where recovery belongs, and what can
          wait.
        </p>
        <div className="app-subcard mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
          <Target size={14} />
          {tasks.length} active task{tasks.length === 1 ? "" : "s"} available for planning
        </div>
      </div>
    </section>
  );
}

function InsightCard({
  icon: Icon,
  label,
  body,
}: {
  icon: LucideIcon;
  label: string;
  body: string;
}) {
  return (
    <div className="app-subcard rounded-[20px] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-deep)]">
        <Icon size={15} />
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        {body}
      </p>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
        {label}
      </p>
    </div>
  );
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-subcard rounded-[14px] p-2.5 text-center">
      <p className="text-base font-semibold">{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
        {label}
      </p>
    </div>
  );
}

function EnergyBadge({ level }: { level: "low" | "medium" | "high" }) {
  const Icon = level === "high" ? Zap : level === "low" ? BatteryLow : Gauge;

  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-accent)]/42 px-2.5 py-1 text-[10px] font-semibold capitalize text-[var(--color-primary-deep)]">
      <Icon size={12} />
      {level} energy
    </span>
  );
}

function getBlockVisual(type: PlannerScheduleBlock["type"]) {
  switch (type) {
    case "focus":
      return {
        icon: Target,
        marker:
          "border-[var(--color-primary)]/35 bg-[var(--color-accent)] text-[var(--color-primary-deep)]",
        card:
          "border-[var(--color-primary)]/24 bg-[var(--color-accent)]/22",
      };
    case "recovery":
    case "rest":
      return {
        icon: Coffee,
        marker:
          "border-[var(--color-border)] bg-[var(--color-card-hover)] text-[var(--color-primary-deep)]",
        card: "border-[var(--color-border)] bg-[var(--color-card-soft)]",
      };
    case "commitment":
      return {
        icon: CalendarClock,
        marker:
          "border-[var(--color-primary-deep)]/30 bg-[var(--color-card-hover)] text-[var(--color-primary-deep)]",
        card:
          "border-[var(--color-primary-deep)]/20 bg-[var(--color-card-soft)]",
      };
    case "admin":
      return {
        icon: CheckCircle2,
        marker:
          "border-[var(--color-border)] bg-[var(--color-card-hover)] text-[var(--color-primary-deep)]",
        card: "border-[var(--color-border)] bg-[var(--color-card-soft)]",
      };
    default:
      return {
        icon: TimerReset,
        marker:
          "border-[var(--color-primary)]/30 bg-[var(--color-card-hover)] text-[var(--color-primary-deep)]",
        card: "border-[var(--color-border)] bg-[var(--color-card-soft)]",
      };
  }
}

function getLiveEmotionalSummary(
  mood: MoodKey,
  energy: EnergyLevel,
  note: string
) {
  const noteContext = note.trim()
    ? " Maui will treat the detail you added as a current constraint."
    : "";

  if (mood === "overwhelmed") {
    return `Choice pressure is high and energy is ${energy}. The plan should narrow priorities and make postponement explicit.${noteContext}`;
  }

  if (mood === "stressed") {
    return `Pressure is present with ${energy} energy. Maui should protect the closest deadline without filling the entire window.${noteContext}`;
  }

  if (mood === "tired") {
    return `Energy is limited. Maui should use shorter commitments and leave recovery between demanding blocks.${noteContext}`;
  }

  if (mood === "hopeful") {
    return `There is useful momentum with ${energy} energy. Maui should use it without turning optimism into overcommitment.${noteContext}`;
  }

  return `Your emotional state appears relatively clear with ${energy} energy. Priorities and deadlines can lead while capacity stays protected.${noteContext}`;
}

function buildTodayContext({
  note,
  studyProfile,
  energyLevel,
  availableMinutes,
}: {
  note: string;
  studyProfile: StudyProfile | null;
  energyLevel: EnergyLevel;
  availableMinutes: number;
}) {
  return [
    note.trim() ? `Current user context: ${note.trim()}` : "",
    `Current energy: ${energyLevel}`,
    `Planning horizon: ${availableMinutes} minutes`,
    studyProfile?.fixedCommitments
      ? `Fixed commitments: ${studyProfile.fixedCommitments}`
      : "",
    studyProfile?.choresAndErrands
      ? `Chores and errands: ${studyProfile.choresAndErrands}`
      : "",
    studyProfile?.wellbeingAndFun
      ? `Rest and wellbeing: ${studyProfile.wellbeingAndFun}`
      : "",
    studyProfile?.planningNotes
      ? `Saved planning notes: ${studyProfile.planningNotes}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildHistoryContext(history: MoodEntry[], current: MoodEntry) {
  return [current, ...history]
    .slice(0, 6)
    .map((entry) => `${entry.label}${entry.note ? `: ${entry.note}` : ""}`)
    .join("\n");
}

function buildTaskItems(studyProfile: StudyProfile | null): TaskItem[] {
  return (
    studyProfile?.generatedTasks
      .filter((task) => task.status !== "done")
      .slice(0, 20)
      .map((task) => ({
        id: task.id,
        title: task.title,
        subject: task.subject,
        category: task.category,
        status: task.status,
        priority: task.priority,
        urgency:
          task.priority === "high" ? 9 : task.priority === "medium" ? 6 : 4,
        difficulty:
          task.difficulty === "hard"
            ? 7
            : task.difficulty === "medium"
              ? 5
              : 3,
        deadlineWeight: task.deadline ? 3 : 1,
        focusMinutes: Math.min(90, Math.max(15, task.estimatedMinutes)),
        progress: task.progress,
        deadline: task.deadline,
        recurrence: task.recurrence,
        steps: [],
      })) ?? []
  );
}

function mergeTaskItems(...groups: TaskItem[][]) {
  const tasks = new Map<string, TaskItem>();

  for (const group of groups) {
    for (const task of group) {
      if (!task.id || task.status === "done") {
        continue;
      }

      tasks.set(task.id, { ...(tasks.get(task.id) ?? {}), ...task });
    }
  }

  return [...tasks.values()];
}

function readStoredHistory(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as MoodEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatHistoryTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
  }).format(new Date(value));
}
