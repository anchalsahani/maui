"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock,
  Loader2,
  Route,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { TaskItem } from "@/components/app/dashboard/types";
import type { PlannerResult } from "@/lib/ai/types";
import type { StudyProfile, UserSurvey } from "@/lib/auth/types";

interface PlannerWorkspaceProps {
  survey: UserSurvey;
  studyProfile: StudyProfile | null;
}

export default function PlannerWorkspace({
  survey,
  studyProfile,
}: PlannerWorkspaceProps) {
  const [availableMinutes, setAvailableMinutes] = useState(60);
  const [energy, setEnergy] = useState<"steady" | "tired" | "overwhelmed">(
    survey.energyPattern === "low" ? "tired" : "steady"
  );
  const [todayNotes, setTodayNotes] = useState("");
  const [plan, setPlan] = useState<PlannerResult | null>(null);
  const [warning, setWarning] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  const tasks = useMemo(() => buildTaskItems(studyProfile), [studyProfile]);

  async function generatePlan() {
    setIsPlanning(true);
    setWarning("");

    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availableMinutes,
          emotionState: energy,
          burnoutRisk:
            energy === "overwhelmed" ? "high" : energy === "tired" ? "medium" : "low",
          todayNotes,
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

      setPlan(data.plan);
      setWarning(data.warning ?? "");
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Planner failed.");
    } finally {
      setIsPlanning(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,250,250,0.96))]" />

      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-5 pb-14 pt-24 lg:grid-cols-[0.78fr_1.22fr]">
        <section className="h-fit rounded-[28px] border border-[var(--color-border)] bg-white/76 p-5 shadow-[0_18px_55px_rgba(53,85,63,0.08)] sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-deep)]">
            <Sparkles size={17} />
            Planner
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight text-[var(--color-dark)] sm:text-4xl">
            Your day at a glance
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Add today&apos;s messy details and Maui will turn them into a simple sequence that protects momentum.
          </p>

          <div className="mt-7 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-dark)]">
                Available minutes
              </span>
              <input
                type="number"
                min={15}
                max={240}
                step={5}
                value={availableMinutes}
                onChange={(event) => setAvailableMinutes(Number(event.target.value))}
                className="input mt-2 h-12 w-full"
              />
            </label>

            <div>
              <p className="text-sm font-medium text-[var(--color-dark)]">
                Current energy
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["steady", "tired", "overwhelmed"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEnergy(value)}
                    className={`h-11 rounded-full border text-sm font-semibold capitalize transition ${
                      energy === value
                        ? "border-[var(--color-primary)] bg-[var(--color-accent)] text-[var(--color-primary-deep)]"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[var(--color-dark)]">
                Today notes
              </span>
              <textarea
                value={todayNotes}
                onChange={(event) => setTodayNotes(event.target.value)}
                maxLength={5000}
                className="input mt-2 min-h-44 resize-y"
                placeholder="Paste today's deadlines, appointments, chores, syllabus, distractions, gaming rules, meals, sleep target, and what usually blocks you."
              />
              <span className="mt-1 block text-xs text-[var(--color-text-secondary)]">
                {todayNotes.length}/5000
              </span>
            </label>

            <button
              type="button"
              onClick={generatePlan}
              disabled={isPlanning || tasks.length === 0}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-dark)] text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isPlanning ? <Loader2 className="animate-spin" size={17} /> : <Brain size={17} />}
              Plan my day
            </button>

            {warning ? (
              <p className="rounded-[18px] border border-[var(--color-border)] bg-white/78 p-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                {warning}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--color-border)] bg-white/72 p-5 shadow-[0_18px_55px_rgba(53,85,63,0.08)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--color-primary-deep)]">
                {studyProfile?.studying ?? "Whole-day plan"}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--color-dark)]">
                {plan?.headline ?? "A simple sequence for today"}
              </h2>
            </div>
            <span className="rounded-full bg-[var(--color-accent)]/65 px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
              {tasks.length} tasks
            </span>
          </div>

          {plan ? (
            <div className="mt-5 rounded-[22px] bg-[var(--color-accent)]/36 p-4 text-sm leading-6 text-[var(--color-dark)]">
              {plan.framing}
            </div>
          ) : null}

          <div className="mt-6">
            {plan ? (
              <div className="space-y-4">
                {plan.dayAtGlance.map((block, index) => (
                  <article
                    key={`${block.timeLabel}-${block.title}-${index}`}
                    className="relative overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white/84 p-4"
                  >
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-[var(--color-primary)]/70" />
                    <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
                            <Clock size={13} />
                            {block.timeLabel}
                          </span>
                          <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--color-text-secondary)]">
                            {block.energy} energy
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-bold leading-tight text-[var(--color-dark)]">
                          {block.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                          {block.goal}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 pl-2 sm:grid-cols-2">
                      {block.actions.map((action) => (
                        <p
                          key={action}
                          className="rounded-[16px] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-dark)]"
                        >
                          {action}
                        </p>
                      ))}
                    </div>
                    <p className="mt-3 rounded-[16px] bg-[var(--color-accent)]/34 px-3 py-2 text-sm leading-6 text-[var(--color-primary-deep)]">
                      {block.adhdNote}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-[var(--color-border)] bg-white/62 p-6 text-sm leading-6 text-[var(--color-text-secondary)]">
                {tasks.length === 0
                  ? "Add your whole-day details in Personalization so Maui has tasks to plan."
                  : "Generate a day plan when you are ready."}
              </div>
            )}
          </div>

          {plan ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <InsightPanel icon={Route} title="Priority order" items={plan.priorityOrder} />
              <InsightPanel icon={ShieldCheck} title="Hard rules" items={plan.hardRules} />
              <InsightPanel icon={AlertCircle} title="If you freeze" items={plan.emergencyProtocol} />
              <InsightPanel icon={CheckCircle2} title="A successful day is" items={plan.realisticOutcome} />
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function InsightPanel({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-white/78 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-dark)]">
        <Icon size={16} />
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

function buildTaskItems(studyProfile: StudyProfile | null): TaskItem[] {
  return (
    studyProfile?.generatedTasks
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
          "Review the most relevant notes.",
          "Do one visible practice action.",
        ],
      })) ?? []
  );
}
