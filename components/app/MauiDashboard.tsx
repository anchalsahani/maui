"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Clock3,
  Compass,
  Coffee,
  Gauge,
  HeartPulse,
  Play,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Trophy,
} from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import ReadyFlowModal from "@/components/app/dashboard/ReadyFlowModal";
import RewardToast from "@/components/app/dashboard/RewardToast";
import StuckFlowModal from "@/components/app/dashboard/StuckFlowModal";
import TiredFlowModal from "@/components/app/dashboard/TiredFlowModal";
import FocusTimer from "@/components/app/dashboard/FocusTimer";
import {
  completeFocusTimer,
  getFocusTimerSnapshot,
  pauseFocusTimer,
  resetFocusTimer,
  resumeFocusTimer,
  startFocusTimer,
} from "@/components/app/dashboard/focusTimerStore";
import type {
  EmotionState,
  EntryMode,
  PersistedDashboardState,
  RewardState,
  SessionState,
  TaskItem,
} from "@/components/app/dashboard/types";
import type { UserSurvey } from "@/lib/auth/types";
import type { StudyProfile } from "@/lib/auth/types";
import type { BurnoutAnalysis, BurnoutRisk, TaskBreakdownResult } from "@/lib/ai/types";
import FloatingModal from "@/components/ui/FloatingModal";

const STORAGE_KEY = "maui-dashboard-state";
const DASHBOARD_STATE_VERSION = "title-wrap-v2";
type RewardEventType = "focus_session" | "micro_step" | "broken_down_task";

interface RewardEvent {
  id: string;
  type: RewardEventType;
  points: number;
  title: string;
  createdAt: string;
}

interface RewardSummary {
  totalPoints: number;
  sessionsCompleted: number;
  microTasksCompleted: number;
  streak: number;
}

interface MentorSnapshot {
  state: "steady" | "support" | "protect";
  title: string;
  body: string;
  nextAction: string;
  focusPattern: string;
  signals: string[];
}

const starterTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Finish the landing page copy pass",
    urgency: 9,
    difficulty: 4,
    deadlineWeight: 3,
    focusMinutes: 20,
    steps: [
      "Open the working file",
      "Read the first section only",
      "Rewrite the headline",
      "Tighten one paragraph",
    ],
  },
  {
    id: "task-2",
    title: "Review auth flow edge cases",
    urgency: 8,
    difficulty: 5,
    deadlineWeight: 2,
    focusMinutes: 20,
    steps: [
      "Open the login and signup routes",
      "List one missing edge case",
      "Check one redirect path",
      "Write the next fix note",
    ],
  },
  {
    id: "task-3",
    title: "Prepare dashboard feature notes",
    urgency: 6,
    difficulty: 3,
    deadlineWeight: 1,
    focusMinutes: 20,
    steps: [
      "Open the notes doc",
      "Write one user goal",
      "Write one blocker",
      "Choose one feature to build next",
    ],
  },
];

const idleSession: SessionState = {
  status: "idle",
  title: "",
  mode: "pomodoro",
  focusMinutes: 20,
  runId: 0,
};

function buildStarterTasks(survey: UserSurvey): TaskItem[] {
  return starterTasks.map((task) => ({
    ...task,
    focusMinutes: 20,
    difficulty:
      survey.energyPattern === "low" ? Math.max(1, task.difficulty - 1) : task.difficulty,
    steps:
      survey.taskPace === "tiny"
        ? [
            "Open the task",
            task.steps[0],
            task.steps[1] ?? "Do one tiny visible action",
            "Stop after one small win if needed",
          ]
        : task.steps,
  }));
}

function splitTaskText(text: string) {
  return text
    .replace(/^study\s+/i, "")
    .split(/[,;|]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function getReadableTaskTitle(title: string) {
  const parts = splitTaskText(title);
  const firstPart = parts[0] ?? title.replace(/^Study\s+/i, "").trim();

  return firstPart;
}

function buildTaskSteps(taskTitle: string, subject: string) {
  const parts = splitTaskText(taskTitle);
  const topicSteps = parts.length > 1 ? parts.slice(0, 4) : [getActionHint(taskTitle, subject)];

  return [`Open ${subject}`, ...topicSteps, "Write a tiny recall note"].slice(0, 5);
}

function getActionHint(title: string, subject: string) {
  const text = `${title} ${subject}`.toLowerCase();

  if (/appointment|lecture|call|class|meeting|commute/.test(text)) {
    return "Prepare what you need before it starts";
  }

  if (/email|reply|internship/.test(text)) {
    return "Send a short good-enough reply";
  }

  if (/clean|desk|laundry|trash|grocery|bottle|organize|charge/.test(text)) {
    return "Do the smallest visible version";
  }

  if (/sleep|lunch|walk|break|game|music|rest|meal/.test(text)) {
    return "Protect this as support, not a reward you must earn";
  }

  return "Study one focused chunk";
}

function getTaskCategory(task: {
  title: string;
  subject?: string;
  category?: string;
}) {
  if (task.category) {
    return task.category;
  }

  const text = `${task.subject ?? ""} ${task.title}`.toLowerCase();

  if (/fixed|appointment|lecture|class|call|meeting|commute|submission/.test(text)) {
    return "commitment";
  }

  if (/chore|errand|household|clean|laundry|trash|grocery|bottle|organize|charge/.test(text)) {
    return "chore";
  }

  if (/wellbeing|game|rest|social|sleep|lunch|dinner|walk|break|music|meal/.test(text)) {
    return "wellbeing";
  }

  return "study";
}

function getSequenceScore(task: {
  title: string;
  subject?: string;
  priority?: "low" | "medium" | "high";
  category?: string;
}) {
  const text = `${task.subject ?? ""} ${task.title}`.toLowerCase();
  const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  const category = getTaskCategory(task);
  let base =
    category === "commitment"
      ? 100
      : category === "wellbeing"
        ? 500
        : category === "study"
          ? 300
          : 400;

  if (timeMatch) {
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2] ?? "0");
    const period = timeMatch[3].toLowerCase();
    const hour24 =
      period === "pm" && hour !== 12
        ? hour + 12
        : period === "am" && hour === 12
          ? 0
          : hour;

    base = category === "commitment" ? hour24 * 10 + minute / 10 : base + hour24;
  }

  if (/email|reply/.test(text)) {
    base = 210;
  }

  if (/reset|water|charge|trash/.test(text)) {
    base = 220;
  }

  if (/assignment|submission|deadline/.test(text)) {
    base = Math.min(base, 260);
  }

  if (/lunch|meal|eat/.test(text)) {
    base = 340;
  }

  if (/walk|break/.test(text)) {
    base = 460;
  }

  if (/sleep|wind/.test(text)) {
    base = 620;
  }

  if (/game|gaming/.test(text)) {
    base = 610;
  }

  return base;
}

function sortDayTasks<T extends { title: string; subject?: string; priority?: "low" | "medium" | "high"; category?: string }>(
  tasks: T[]
) {
  return [...tasks].sort((a, b) => {
    const scoreDelta = getSequenceScore(a) - getSequenceScore(b);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    const priorityScore = { high: 0, medium: 1, low: 2 };

    return (priorityScore[a.priority ?? "medium"] ?? 1) - (priorityScore[b.priority ?? "medium"] ?? 1);
  });
}

function formatTaskCategory(category: string | undefined) {
  switch (category) {
    case "commitment":
      return "Fixed commitment";
    case "chore":
      return "Chore or errand";
    case "wellbeing":
      return "Wellbeing";
    default:
      return "Study";
  }
}

function getLocalDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCalendarDayLabel(dayKey: string) {
  const date = new Date(`${dayKey}T00:00:00`);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getStreakCalendarDays(totalDays = 84) {
  const today = new Date();
  const start = new Date(today);

  start.setDate(today.getDate() - (totalDays - 1));

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      key: getLocalDayKey(date),
      date,
      weekday: date.getDay(),
      month: date.toLocaleDateString(undefined, { month: "short" }),
    };
  });
}

function getActivityTone(count: number) {
  if (count >= 5) {
    return "bg-[#1f5f3a]";
  }

  if (count >= 3) {
    return "bg-[#2f855a]";
  }

  if (count >= 2) {
    return "bg-[#4fb477]";
  }

  if (count === 1) {
    return "bg-[#9bd8ad]";
  }

  return "bg-[#d7ded7]";
}

function getRewardSummaryFromEvents(events: RewardEvent[]): RewardSummary {
  const activeDays = new Set(
    events.map((event) => getLocalDayKey(new Date(event.createdAt)))
  );
  let streak = 0;
  const cursor = new Date();

  while (activeDays.has(getLocalDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalPoints: events.reduce((total, event) => total + event.points, 0),
    sessionsCompleted: events.filter((event) => event.type === "focus_session").length,
    microTasksCompleted: events.filter((event) => event.type === "micro_step").length,
    streak,
  };
}

function getRewardStateFromSummary(summary: RewardSummary): RewardState {
  return {
    points: summary.totalPoints,
    streak: summary.streak,
    sessionsCompleted: summary.sessionsCompleted,
    microTasksCompleted: summary.microTasksCompleted,
  };
}

function getTodaysEvents(events: RewardEvent[]) {
  const todayKey = getLocalDayKey(new Date());

  return events.filter((event) => getLocalDayKey(new Date(event.createdAt)) === todayKey);
}

function buildMentorSnapshot({
  burnoutRisk,
  completedTaskIds,
  emotionState,
  nextTask,
  recentMoments,
  rewardEvents,
  session,
  taskChecklist,
}: {
  burnoutRisk: BurnoutRisk;
  completedTaskIds: string[];
  emotionState: EmotionState;
  nextTask: TaskItem | null;
  recentMoments: string[];
  rewardEvents: RewardEvent[];
  session: SessionState;
  taskChecklist: TaskItem[];
}): MentorSnapshot {
  const todayEvents = getTodaysEvents(rewardEvents);
  const focusSessionsToday = todayEvents.filter(
    (event) => event.type === "focus_session"
  ).length;
  const microStepsToday = todayEvents.filter((event) => event.type === "micro_step").length;
  const completionRatio =
    taskChecklist.length > 0 ? completedTaskIds.length / taskChecklist.length : 0;
  const stoppedMidway = recentMoments.some((moment) =>
    /stopped midway|reset the session|paused/i.test(moment)
  );
  const signals = [
    `${completedTaskIds.length}/${taskChecklist.length || 0} tasks complete`,
    `${focusSessionsToday} focus block${focusSessionsToday === 1 ? "" : "s"} today`,
    `${microStepsToday} micro win${microStepsToday === 1 ? "" : "s"} today`,
    `mood: ${emotionState}`,
  ];

  if (stoppedMidway) {
    signals.push("midway stop noticed");
  }

  if (session.status === "active") {
    return {
      state: "steady",
      title: "Stay with the current block.",
      body: "Maui is watching for momentum, not perfection. Keep the next few minutes boring and visible.",
      nextAction: "Continue until the timer ends, then reassess energy.",
      focusPattern: "In-session focus",
      signals,
    };
  }

  if (burnoutRisk === "high" || emotionState === "overwhelmed" || stoppedMidway) {
    return {
      state: "protect",
      title: "Protect energy before pushing harder.",
      body: "The pattern says pressure may be too high right now. Maui should lower the task size and avoid a full-day replanning spiral.",
      nextAction: nextTask
        ? `Do only the first tiny step for "${nextTask.title}".`
        : "Pick one tiny reset action and stop there.",
      focusPattern: "Overload prevention",
      signals,
    };
  }

  if (burnoutRisk === "medium" || emotionState === "tired" || completionRatio < 0.25) {
    return {
      state: "support",
      title: "Use a lighter start.",
      body: "The day still needs structure, but a smaller doorway will work better than forcing a deep session.",
      nextAction: nextTask
        ? `Start ${nextTask.focusMinutes > 20 ? "15" : "10"} minutes on "${nextTask.title}".`
        : "Create one task that can be started in under 2 minutes.",
      focusPattern: "Gentle ramp-up",
      signals,
    };
  }

  return {
    state: "steady",
    title: "Momentum is available.",
    body: "The pattern looks stable enough for one focused block. Maui will keep the plan narrow so it stays startable.",
    nextAction: nextTask
      ? `Begin the next focus block for "${nextTask.title}".`
      : "Review the next useful task and choose one small win.",
    focusPattern: "Healthy momentum",
    signals,
  };
}

function StreakCalendar({
  events,
  streak,
  isLoading,
}: {
  events: RewardEvent[];
  streak: number;
  isLoading: boolean;
}) {
  const days = useMemo(() => getStreakCalendarDays(), []);
  const leadingBlankDays = days[0]?.weekday ?? 0;
  const calendarCells = [
    ...Array.from({ length: leadingBlankDays }, (_, index) => ({
      type: "blank" as const,
      key: `blank-${index}`,
    })),
    ...days.map((day) => ({
      type: "day" as const,
      day,
      key: day.key,
    })),
  ];
  const todayKey = getLocalDayKey(new Date());
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const activityByDay = useMemo(() => {
    return events.reduce<Record<string, RewardEvent[]>>((daysMap, event) => {
      const dayKey = getLocalDayKey(new Date(event.createdAt));

      daysMap[dayKey] = [...(daysMap[dayKey] ?? []), event];
      return daysMap;
    }, {});
  }, [events]);
  const selectedEvents = activityByDay[selectedDay] ?? [];
  const activeDays = Object.keys(activityByDay).length;
  const totalPoints = events.reduce((total, event) => total + event.points, 0);
  const monthLabels = days.reduce<Array<{ month: string; index: number }>>(
    (labels, day, index) => {
      if (index === 0 || day.date.getDate() <= 7) {
        const previous = labels[labels.length - 1];

        if (!previous || previous.month !== day.month) {
          labels.push({ month: day.month, index });
        }
      }

      return labels;
    },
    []
  );

  return (
    <div className="rounded-[32px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] p-6 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Streak calendar
          </p>
          <h2 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--color-dark)]">
            {streak} day streak
          </h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/45 text-[var(--color-primary-deep)]">
          <CalendarDays size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-[18px] bg-white/72 px-3 py-3">
          <p className="text-[1.25rem] font-semibold tracking-[-0.04em] text-[var(--color-dark)]">
            {activeDays}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Active days
          </p>
        </div>
        <div className="rounded-[18px] bg-white/72 px-3 py-3">
          <p className="text-[1.25rem] font-semibold tracking-[-0.04em] text-[var(--color-dark)]">
            {events.length}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Wins
          </p>
        </div>
        <div className="rounded-[18px] bg-white/72 px-3 py-3">
          <p className="text-[1.25rem] font-semibold tracking-[-0.04em] text-[var(--color-dark)]">
            {totalPoints}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Earned
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="min-w-[560px]">
          <div className="relative mb-2 h-4">
            {monthLabels.map((label) => (
              <span
                key={`${label.month}-${label.index}`}
                className="absolute text-[10px] font-medium text-[var(--color-text-secondary)]"
                style={{ left: `${((label.index + leadingBlankDays) / calendarCells.length) * 100}%` }}
              >
                {label.month}
              </span>
            ))}
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-1.5">
            {calendarCells.map((cell) => {
              if (cell.type === "blank") {
                return <span key={cell.key} className="h-4 w-4" />;
              }

              const day = cell.day;
              const dayEvents = activityByDay[day.key] ?? [];
              const isSelected = selectedDay === day.key;
              const isToday = day.key === todayKey;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDay(day.key)}
                  title={`${getCalendarDayLabel(day.key)}: ${dayEvents.length} win${dayEvents.length === 1 ? "" : "s"}`}
                  className={`h-4 w-4 rounded-[5px] border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.38)] transition-all duration-150 hover:scale-110 ${
                    getActivityTone(dayEvents.length)
                  } ${
                    isSelected
                      ? "border-[var(--color-dark)] shadow-[0_0_0_2px_rgba(255,255,255,0.9)]"
                      : isToday
                        ? "border-[var(--color-primary-deep)]"
                        : "border-[rgba(47,74,57,0.18)]"
                  }`}
                  aria-label={`${getCalendarDayLabel(day.key)} has ${dayEvents.length} completed activities`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-text-secondary)]">
          Less
        </p>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 5].map((count) => (
            <span
              key={count}
              className={`h-3.5 w-3.5 rounded-[4px] border border-[rgba(47,74,57,0.18)] ${getActivityTone(count)}`}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          More
        </p>
      </div>

      <div className="mt-5 rounded-[22px] bg-white/66 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--color-dark)]">
            {getCalendarDayLabel(selectedDay)}
          </p>
          <span className="rounded-full bg-[var(--color-accent)]/58 px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
            {selectedEvents.length} win{selectedEvents.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">
            Loading your activity...
          </p>
        ) : selectedEvents.length > 0 ? (
          <div className="mt-3 space-y-2">
            {selectedEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate text-xs text-[var(--color-text-secondary)]">
                  {event.title}
                </p>
                <span className="shrink-0 text-xs font-semibold text-[var(--color-primary-deep)]">
                  +{event.points}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">
            Complete a focus session or tiny step to light up this day.
          </p>
        )}
      </div>
    </div>
  );
}

function getInitialDashboardState(
  survey: UserSurvey,
  studyProfile: StudyProfile | null
): PersistedDashboardState {
  const syllabusTasks =
    sortDayTasks(studyProfile?.generatedTasks ?? []).map((task) => ({
      id: task.id,
      title: getReadableTaskTitle(task.title),
      topicId: task.topicId,
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
      steps: buildTaskSteps(task.title, task.subject),
    })) ?? [];

  return {
    tasks: syllabusTasks.length > 0 ? syllabusTasks : buildStarterTasks(survey),
    taskChecklist: syllabusTasks.length > 0 ? syllabusTasks : buildStarterTasks(survey),
    completedTaskIds: [],
    reward: {
      points: 12,
      streak: 3,
      sessionsCompleted: 0,
      microTasksCompleted: 0,
    },
    session: idleSession,
    recentMoments: ["You showed up today. That counts."],
    completedMicroSteps: [],
    emotionDraft: "",
  };
}

function getTaskScore(task: TaskItem) {
  return task.urgency + task.deadlineWeight - task.difficulty;
}

function detectEmotion(input: string): {
  state: EmotionState;
  burnoutRisk: BurnoutRisk;
  confidence: number;
  title: string;
  suggestedAdjustment: string;
  nextStep: string;
  signals: string[];
  crisisFlag: boolean;
} {
  const text = input.toLowerCase();
  const keywords = [
    "stuck",
    "overwhelmed",
    "panic",
    "stress",
    "deadline",
    "tired",
    "drained",
    "exhausted",
    "sad",
    "anxious",
    "ready",
    "okay",
    "hopeful",
  ].filter((keyword) => text.includes(keyword));

  if (/(panic|spiral|overwhelmed|too much|freeze|stuck)/.test(text)) {
    return {
      state: "overwhelmed",
      burnoutRisk: "high",
      confidence: 0.74,
      title: "You sound overwhelmed.",
      suggestedAdjustment: "Maui should lower the pressure, cut the task smaller, and avoid asking you to plan the whole thing.",
      nextStep: "Open one task and do only the first visible action.",
      signals: keywords,
      crisisFlag: false,
    };
  }

  if (/(tired|exhausted|drained|sleepy|burnt)/.test(text)) {
    return {
      state: "tired",
      burnoutRisk: "medium",
      confidence: 0.7,
      title: "Low energy detected.",
      suggestedAdjustment: "Maui should keep things lighter right now and prefer a gentler first action over a full session.",
      nextStep: "Try a 10 minute setup or review block.",
      signals: keywords,
      crisisFlag: false,
    };
  }

  if (/(stress|anxious|pressure|deadline|worried)/.test(text)) {
    return {
      state: "stressed",
      burnoutRisk: "medium",
      confidence: 0.68,
      title: "Stress is showing up here.",
      suggestedAdjustment: "A very concrete next move will help more than a long plan. Keep the scope small and visible.",
      nextStep: "Choose one task and write the first two actions.",
      signals: keywords,
      crisisFlag: false,
    };
  }

  if (/(ready|okay|good|better|hopeful)/.test(text)) {
    return {
      state: "hopeful",
      burnoutRisk: "low",
      confidence: 0.62,
      title: "There is some momentum here.",
      suggestedAdjustment: "This is a good moment to start a normal task block before the energy fades.",
      nextStep: "Start the highest value task for one focused block.",
      signals: keywords,
      crisisFlag: false,
    };
  }

  return {
    state: "steady",
    burnoutRisk: "low",
    confidence: 0.55,
    title: "A steady state for now.",
    suggestedAdjustment: "No strong signal showed up, so Maui should offer one calm next step without extra pressure.",
    nextStep: "Start with a small visible action.",
    signals: keywords,
    crisisFlag: false,
  };
}

function buildMicroSteps(task: TaskItem) {
  const topic = getReadableTaskTitle(task.title);

  return [
    `Open the topic ${topic} in your notes.`,
    "Read the topic completely and highlight the important points.",
    "Write a short summary.",
    `Explain ${topic} in 1 sentence.`,
    "Take a 2 min breather.",
  ];
}

function FlowCard({
  title,
  body,
  tone,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  body: string;
  tone: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6, rotateX: 2 }}
      whileTap={{ scale: 0.985 }}
      className={`group relative flex h-full min-h-[176px] overflow-hidden rounded-[30px] border p-5 text-left transition-all duration-300 ${
        active
          ? "border-[var(--color-primary)]/42 bg-[linear-gradient(180deg,rgba(207,232,213,0.42),rgba(255,255,255,0.86))] shadow-[0_30px_70px_rgba(53,85,63,0.12)]"
          : "border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] shadow-[0_18px_55px_rgba(53,85,63,0.08)]"
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(207,232,213,0.5),transparent_38%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex h-full min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/78 text-[var(--color-primary-deep)] shadow-[0_10px_24px_rgba(53,85,63,0.08)]">
            <Icon size={20} />
          </div>
          <ChevronRight
            className="mt-1 text-[var(--color-text-secondary)] transition-transform duration-300 group-hover:translate-x-1"
            size={18}
          />
        </div>
        <h2 className="mt-5 min-h-[2.9rem] text-[1.12rem] font-semibold leading-[1.28] tracking-[-0.03em] text-[var(--color-dark)]">
          {title}
        </h2>
        {body ? (
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            {body}
          </p>
        ) : null}
        <div className="mt-auto inline-flex w-fit rounded-full border border-white/55 bg-white/72 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
          {tone}
        </div>
      </div>
    </motion.button>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/45 bg-white/70 p-5 shadow-[0_18px_55px_rgba(53,85,63,0.08)]">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--color-accent)]/45" />
      <div className="mt-5 h-6 w-28 animate-pulse rounded-full bg-[var(--color-accent)]/38" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-[var(--color-accent)]/28" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-[var(--color-accent)]/28" />
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-[26px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(247,250,248,0.78))] p-4 shadow-[0_18px_55px_rgba(53,85,63,0.08)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/48 text-[var(--color-primary-deep)]">
          <Icon size={18} />
        </div>
        <p className="text-[1.45rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
          {value}
        </p>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
        {label}
      </p>
    </motion.div>
  );
}

function MentorCard({ snapshot }: { snapshot: MentorSnapshot }) {
  const tone =
    snapshot.state === "protect"
      ? {
          icon: ShieldCheck,
          label: "Protect",
          className: "border-[#9f7b42]/20 bg-[#fff6e5]/78 text-[#735725]",
        }
      : snapshot.state === "support"
        ? {
            icon: HeartPulse,
            label: "Support",
            className: "border-[var(--color-primary)]/24 bg-[var(--color-accent)]/46 text-[var(--color-primary-deep)]",
          }
        : {
            icon: Compass,
            label: "Steady",
            className: "border-[var(--color-border)] bg-white/76 text-[var(--color-primary-deep)]",
          };
  const Icon = tone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
      className="rounded-[32px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(242,250,244,0.82))] p-6 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl sm:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tone.className}`}
            >
              <Icon size={14} />
              Mentor read: {tone.label}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/72 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
              <Activity size={14} />
              {snapshot.focusPattern}
            </span>
          </div>

          <h2 className="mt-4 text-[clamp(1.35rem,2.4vw,1.9rem)] font-semibold leading-tight tracking-[-0.04em] text-[var(--color-dark)]">
            {snapshot.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            {snapshot.body}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/55 bg-white/74 p-4 lg:w-[300px]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Next healthy move
          </p>
          <p className="mt-2 text-sm font-semibold leading-5 text-[var(--color-dark)]">
            {snapshot.nextAction}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {snapshot.signals.map((signal) => (
          <span
            key={signal}
            className="rounded-full border border-[var(--color-border)] bg-white/64 px-3 py-1.5 text-xs text-[var(--color-text-secondary)]"
          >
            {signal}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function MauiDashboard({
  userName,
  survey,
  studyProfile,
}: {
  userName: string;
  survey: UserSurvey;
  studyProfile: StudyProfile | null;
}) {
  const dashboardRoadmapKey =
    `${studyProfile?.updatedAt ?? `starter-${survey.focusWindow}-${survey.taskPace}`}-${DASHBOARD_STATE_VERSION}`;
  const initialState = useMemo(
    () => getInitialDashboardState(survey, studyProfile),
    [studyProfile, survey]
  );
  const [tasks, setTasks] = useState<TaskItem[]>(initialState.tasks);
  const [taskChecklist, setTaskChecklist] = useState<TaskItem[]>(
    initialState.taskChecklist ?? initialState.tasks
  );
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [reward, setReward] = useState<RewardState>(initialState.reward);
  const [session, setSession] = useState<SessionState>(initialState.session);
  const [recentMoments, setRecentMoments] = useState<string[]>(
    initialState.recentMoments
  );
  const [completedMicroSteps, setCompletedMicroSteps] = useState<string[]>(
    initialState.completedMicroSteps
  );
  const [activeModal, setActiveModal] = useState<EntryMode>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [emotionInput, setEmotionInput] = useState("");
  const [selectedFocusMinutes, setSelectedFocusMinutes] = useState(20);
  const [rewardToast, setRewardToast] = useState<{
    open: boolean;
    points: number;
    title: string;
  }>({ open: false, points: 0, title: "" });
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);
  const [isLoadingRewardEvents, setIsLoadingRewardEvents] = useState(true);
  const [emotionState, setEmotionState] = useState<EmotionState>("steady");
  const [emotionKeywords, setEmotionKeywords] = useState<string[]>([]);
  const [emotionMessage, setEmotionMessage] = useState({
    title: "Tell Maui what your brain feels like.",
    body: "A short rant is enough. Maui will look for emotional cues and reduce pressure from there.",
  });
  const [burnoutRisk, setBurnoutRisk] = useState<BurnoutRisk>("low");
  const [crisisFlag, setCrisisFlag] = useState(false);
  const [emotionAnalysisError, setEmotionAnalysisError] = useState("");
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [aiBreakdown, setAiBreakdown] = useState<TaskBreakdownResult | null>(null);
  const [breakdownTaskId, setBreakdownTaskId] = useState("");
  const [breakdownError, setBreakdownError] = useState("");
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    function applyPersistedState(parsed: Partial<PersistedDashboardState>) {
      if (cancelled) {
        return;
      }

      const hasFreshRoadmap = parsed.dashboardRoadmapKey === dashboardRoadmapKey;

      setTasks(hasFreshRoadmap ? (parsed.tasks ?? initialState.tasks) : initialState.tasks);
      setTaskChecklist(
        hasFreshRoadmap
          ? (parsed.taskChecklist ?? initialState.taskChecklist ?? initialState.tasks)
          : (initialState.taskChecklist ?? initialState.tasks)
      );
      setCompletedTaskIds(hasFreshRoadmap ? (parsed.completedTaskIds ?? []) : []);
      setReward(parsed.reward ?? initialState.reward);
      setSession(
        hasFreshRoadmap ? (parsed.session ?? initialState.session) : initialState.session
      );
      setRecentMoments(
        hasFreshRoadmap
          ? (parsed.recentMoments ?? initialState.recentMoments)
          : [
              studyProfile?.studying
                ? `Loaded your new ${studyProfile.studying} roadmap.`
                : "Loaded your latest roadmap.",
              ...initialState.recentMoments,
            ]
      );
      setCompletedMicroSteps(
        hasFreshRoadmap
          ? (parsed.completedMicroSteps ?? initialState.completedMicroSteps)
          : initialState.completedMicroSteps
      );
      setEmotionInput(hasFreshRoadmap ? (parsed.emotionDraft ?? "") : "");
    }

    async function restoreDashboardState() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (raw) {
          applyPersistedState(JSON.parse(raw) as Partial<PersistedDashboardState>);
        }
      } catch {
        // Ignore invalid stored state and keep the fresh snapshot.
      }

      try {
        const response = await fetch("/api/dashboard/state", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          state?: Partial<PersistedDashboardState> | null;
        };

        if (data.state) {
          applyPersistedState(data.state);
        }
      } catch {
        // Local storage remains the fallback when server persistence is unavailable.
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    }

    void restoreDashboardState();

    return () => {
      cancelled = true;
    };
  }, [
    initialState.completedMicroSteps,
    initialState.recentMoments,
    initialState.reward,
    initialState.session,
    initialState.taskChecklist,
    initialState.tasks,
    dashboardRoadmapKey,
    studyProfile?.studying,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadRewardEvents() {
      setIsLoadingRewardEvents(true);

      try {
        const response = await fetch("/api/rewards/events", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          events?: RewardEvent[];
          summary?: RewardSummary;
        };

        if (cancelled) {
          return;
        }

        const events = data.events ?? [];
        setRewardEvents(events);

        if (data.summary && events.length > 0) {
          setReward(getRewardStateFromSummary(data.summary));
        }
      } catch {
        // The dashboard still works locally when reward history is unavailable.
      } finally {
        if (!cancelled) {
          setIsLoadingRewardEvents(false);
        }
      }
    }

    void loadRewardEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isRestoring) {
      return;
    }

    const snapshot: PersistedDashboardState = {
      dashboardRoadmapKey,
      tasks,
      taskChecklist,
      completedTaskIds,
      reward,
      session,
      recentMoments,
      completedMicroSteps,
      emotionDraft: emotionInput,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      void fetch("/api/dashboard/state", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: snapshot }),
      }).catch(() => {
        // Local storage already has the latest state if server persistence fails.
      });
    }, 450);

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [
    completedMicroSteps,
    completedTaskIds,
    dashboardRoadmapKey,
    emotionInput,
    isRestoring,
    recentMoments,
    reward,
    session,
    taskChecklist,
    tasks,
  ]);

  const nextTask = useMemo(() => {
    return [...tasks].sort((a, b) => getTaskScore(b) - getTaskScore(a))[0] ?? null;
  }, [tasks]);

  const microSteps = useMemo(() => {
    if (nextTask && aiBreakdown && breakdownTaskId === nextTask.id) {
      return aiBreakdown.microSteps;
    }

    return nextTask ? buildMicroSteps(nextTask) : [];
  }, [aiBreakdown, breakdownTaskId, nextTask]);

  const completedCount = microSteps.filter((step) =>
    nextTask ? completedMicroSteps.includes(getMicroStepKey(nextTask.id, step)) : false
  ).length;
  const allMicroStepsDone = microSteps.length > 0 && completedCount === microSteps.length;
  const mentorSnapshot = useMemo(
    () =>
      buildMentorSnapshot({
        burnoutRisk,
        completedTaskIds,
        emotionState,
        nextTask,
        recentMoments,
        rewardEvents,
        session,
        taskChecklist,
      }),
    [
      burnoutRisk,
      completedTaskIds,
      emotionState,
      nextTask,
      recentMoments,
      rewardEvents,
      session,
      taskChecklist,
    ]
  );
  const firstName = userName.split(" ")[0];

  function recordMoment(message: string) {
    setRecentMoments((current) => [message, ...current].slice(0, 4));
  }

  function showReward(points: number, title: string) {
    setRewardToast({ open: true, points, title });
    window.setTimeout(() => {
      setRewardToast((current) => ({ ...current, open: false }));
    }, 2200);
  }

  function recordRewardActivity(
    type: RewardEventType,
    points: number,
    title: string
  ) {
    void fetch("/api/rewards/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, points, title }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          event?: RewardEvent;
          summary?: RewardSummary;
        };

        if (data.event) {
          setRewardEvents((current) => [data.event as RewardEvent, ...current]);
        }

        if (data.summary) {
          setReward(getRewardStateFromSummary(data.summary));
        }
      })
      .catch(() => {
        const fallbackEvent: RewardEvent = {
          id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type,
          points,
          title,
          createdAt: new Date().toISOString(),
        };

        setRewardEvents((current) => {
          const nextEvents = [fallbackEvent, ...current];
          setReward(getRewardStateFromSummary(getRewardSummaryFromEvents(nextEvents)));

          return nextEvents;
        });
      });
  }

  function getMicroStepKey(taskId: string, step: string) {
    return `${taskId}::${step}`;
  }

  async function openStuckFlow() {
    setActiveModal("stuck");

    if (!nextTask) {
      return;
    }

    if (breakdownTaskId === nextTask.id && aiBreakdown) {
      return;
    }

    setIsGeneratingBreakdown(true);
    setBreakdownError("");

    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: nextTask,
          emotionState,
          burnoutRisk,
          recentMoments,
          completedMicroSteps,
        }),
      });
      const data = (await response.json()) as {
        breakdown?: TaskBreakdownResult;
        warning?: string;
        error?: string;
      };

      if (!response.ok || !data.breakdown) {
        throw new Error(data.error ?? "Task breakdown failed.");
      }

      setAiBreakdown(data.breakdown);
      setBreakdownTaskId(nextTask.id);
      setBreakdownError(data.warning ?? "");
      setCompletedMicroSteps((current) =>
        current.filter((stepKey) => !stepKey.startsWith(`${nextTask.id}::`))
      );
      recordMoment(`Maui broke "${nextTask.title}" into startable micro steps.`);
    } catch (error) {
      setAiBreakdown(null);
      setBreakdownTaskId("");
      setBreakdownError(
        error instanceof Error
          ? `${error.message} Using local micro steps.`
          : "Using local micro steps."
      );
    } finally {
      setIsGeneratingBreakdown(false);
    }
  }

  function startPomodoro() {
    if (!nextTask) {
      recordMoment("No task is ready yet. Add one small task first.");
      return;
    }

    const runId = session.runId + 1;
    setSession({
      status: "active",
      title: nextTask.title,
      mode: "pomodoro",
      focusMinutes: selectedFocusMinutes,
      runId,
    });
    startFocusTimer(nextTask.title, selectedFocusMinutes, runId);
    recordMoment(`Started a ${selectedFocusMinutes}-minute focus block for "${nextTask.title}".`);
  }

  function pauseOrResumeSession() {
    const timer = getFocusTimerSnapshot();

    if (timer.status === "active") {
      pauseFocusTimer();
      setSession((current) => ({ ...current, status: "paused" }));
      return;
    }

    if (timer.status === "paused") {
      resumeFocusTimer();
      setSession((current) => ({ ...current, status: "active" }));
    }
  }

  function completePomodoro() {
    if (!nextTask) {
      return;
    }

    completeFocusTimer();
    setReward((current) => ({
      ...current,
      points: current.points + 8,
      streak: current.streak + 1,
      sessionsCompleted: current.sessionsCompleted + 1,
    }));
    setTasks((current) => current.filter((task) => task.id !== nextTask.id));
    setCompletedTaskIds((current) =>
      current.includes(nextTask.id) ? current : [...current, nextTask.id]
    );
    setSession((current) => ({
      ...current,
      status: "completed",
    }));
    showReward(8, nextTask.title);
    recordRewardActivity("focus_session", 8, nextTask.title);
    recordMoment(`Completed a focus block for "${nextTask.title}".`);
  }

  function resetSession() {
    const runId = session.runId + 1;

    if (session.status === "active" || session.status === "paused") {
      recordMoment(`Stopped midway during "${session.title}". Maui will make the next start smaller.`);
    }

    setSession({
      ...idleSession,
      runId,
    });
    resetFocusTimer(selectedFocusMinutes, runId);
  }

  function toggleMicroStep(step: string) {
    if (!nextTask) {
      return;
    }

    const stepKey = getMicroStepKey(nextTask.id, step);
    const isCompleted = completedMicroSteps.includes(stepKey);

    if (isCompleted) {
      setCompletedMicroSteps((current) => current.filter((item) => item !== stepKey));
      return;
    }

    setCompletedMicroSteps((current) => [...current, stepKey]);
    setReward((current) => ({
      ...current,
      points: current.points + 1,
      microTasksCompleted: current.microTasksCompleted + 1,
    }));
    recordRewardActivity("micro_step", 1, step);
    recordMoment(`Completed micro step: ${step}`);
  }

  function finishBrokenDownTask() {
    if (!nextTask) {
      return;
    }

    setReward((current) => ({
      ...current,
      points: current.points + 4,
      streak: current.streak + 1,
    }));
    setTasks((current) => current.filter((task) => task.id !== nextTask.id));
    setCompletedTaskIds((current) =>
      current.includes(nextTask.id) ? current : [...current, nextTask.id]
    );
    setCompletedMicroSteps((current) =>
      current.filter((stepKey) => !stepKey.startsWith(`${nextTask.id}::`))
    );
    showReward(4, nextTask.title);
    recordRewardActivity("broken_down_task", 4, nextTask.title);
    recordMoment(`Finished the broken-down task "${nextTask.title}".`);
  }

  async function analyzeEmotion() {
    if (!emotionInput.trim()) {
      return;
    }

    setIsAnalyzingEmotion(true);
    setEmotionAnalysisError("");

    try {
      const response = await fetch("/api/ai/burnout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rant: emotionInput,
          context: {
            currentTask: nextTask?.title ?? null,
            recentMoments: recentMoments.slice(0, 5),
            survey,
          },
        }),
      });
      const data = (await response.json()) as {
        analysis?: BurnoutAnalysis;
        warning?: string;
        error?: string;
      };

      if (!response.ok || !data.analysis) {
        throw new Error(data.error ?? "Emotion analysis failed.");
      }

      applyBurnoutAnalysis(data.analysis);
      setEmotionAnalysisError(data.warning ?? "");
      recordMoment(`Emotion check-in analyzed as ${data.analysis.state}.`);
    } catch (error) {
      const result = detectEmotion(emotionInput);
      applyBurnoutAnalysis(result);
      setEmotionAnalysisError(
        error instanceof Error
          ? `${error.message} Local fallback was used.`
          : "Local fallback was used."
      );
      recordMoment(`Emotion check-in analyzed as ${result.state}.`);
    } finally {
      setIsAnalyzingEmotion(false);
    }
  }

  function applyBurnoutAnalysis(result: BurnoutAnalysis) {
    setEmotionState(result.state);
    setEmotionKeywords(result.signals);
    setBurnoutRisk(result.burnoutRisk);
    setCrisisFlag(result.crisisFlag);
    setEmotionMessage({
      title: result.title,
      body: result.crisisFlag
        ? result.nextStep
        : `${result.suggestedAdjustment} ${result.nextStep}`,
    });
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(207,232,213,0.78),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(143,191,159,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.64),rgba(250,250,250,0.96))]" />
      <div className="pointer-events-none absolute left-[-30%] top-[10%] h-[320px] w-[320px] rounded-full bg-[var(--color-accent)]/42 blur-[90px] sm:left-[-8%] sm:h-[520px] sm:w-[520px] sm:blur-[120px]" />
      <div className="pointer-events-none absolute right-[-36%] top-[-8%] h-[340px] w-[340px] rounded-full bg-[var(--color-primary)]/12 blur-[90px] sm:right-[-10%] sm:h-[560px] sm:w-[560px] sm:blur-[120px]" />

      <motion.main
        animate={{ scale: activeModal ? 0.985 : 1, opacity: activeModal ? 0.9 : 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-7xl px-3 pb-10 pt-20 sm:px-6 sm:pb-14 sm:pt-24"
      >
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(242,250,244,0.84))] p-4 shadow-[0_28px_80px_rgba(53,85,63,0.1)] backdrop-blur-2xl sm:rounded-[32px] sm:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(207,232,213,0.95),transparent_68%)]" />
          <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-48 w-48 rounded-full bg-[var(--color-primary)]/18 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="max-w-4xl font-[var(--font-heading)] text-[clamp(2rem,13vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-[var(--color-dark)] sm:tracking-normal">
                Hey,{" "}
                <span className="first-name text-[clamp(2.6rem,15vw,5.8rem)] leading-none text-[var(--color-mainstar)]">
                  {firstName}
                </span>
              </h1>
              <h2 className="mt-3 text-[clamp(1.35rem,8vw,2.35rem)] font-semibold leading-tight tracking-[-0.04em] text-[var(--color-dark)] sm:mt-4">
                How are you feeling?
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--color-text-secondary)] sm:text-[16px]">
                Choose the closest state. Maui will turn it into one clear next move.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:max-w-[420px] xl:flex-1">
              <StatsCard label="Points" value={reward.points} icon={Trophy} />
              <StatsCard label="Streak" value={reward.streak} icon={Sparkles} />
              <StatsCard
                label="Session"
                value={session.status === "active" ? "Live" : "Idle"}
                icon={Clock3}
              />
            </div>
          </div>
        </motion.section>

        <div className="mt-5 grid gap-5 sm:mt-8 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="space-y-5"
          >
            {isRestoring ? (
              <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
                <FlowCard
                  title="Ready to begin?"
                  body=""
                  tone="Begin"
                  icon={Play}
                  active={activeModal === "ready"}
                  onClick={() => setActiveModal("ready")}
                />
                <FlowCard
                  title="Feeling stuck?"
                  body=""
                  tone="Unblock"
                  icon={TimerReset}
                  active={activeModal === "stuck"}
                  onClick={openStuckFlow}
                />
                <FlowCard
                  title="Feeling underwhelmed?"
                  body=""
                  tone="Rant"
                  icon={Coffee}
                  active={activeModal === "tired"}
                  onClick={() => setActiveModal("tired")}
                />
              </div>
            )}

            <MentorCard snapshot={mentorSnapshot} />

            <StreakCalendar
              events={rewardEvents}
              streak={reward.streak}
              isLoading={isLoadingRewardEvents}
            />

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="rounded-[24px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] p-4 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl sm:rounded-[32px] sm:p-7"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Current study focus
                  </p>
                  <h2 className="mt-3 break-words text-[clamp(1.55rem,3vw,2rem)] font-semibold leading-tight tracking-[-0.04em] text-[var(--color-dark)]">
                    {nextTask ? nextTask.title : "No active task right now"}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {nextTask
                      ? "This is what you are studying now. Complete it, and Maui will move you to the next item."
                      : "You can add one gentle starter task next. The dashboard is ready when you are."}
                  </p>
                </div>

                <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 lg:w-[420px]">
                  {[
                    { label: "Urgency", value: nextTask?.urgency ?? "-" },
                    { label: "Difficulty", value: nextTask?.difficulty ?? "-" },
                    { label: "Focus", value: nextTask ? `${nextTask.focusMinutes}m` : "-" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      whileHover={{ y: -4 }}
                      className="min-w-0 rounded-[16px] border border-white/45 bg-white/78 px-2.5 py-3 shadow-[0_12px_30px_rgba(53,85,63,0.06)] sm:rounded-[20px] sm:px-4 sm:py-4"
                    >
                      <p className="truncate text-[1.05rem] font-semibold text-[var(--color-dark)] sm:text-[1.35rem]">
                        {item.value}
                      </p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-secondary)] sm:whitespace-nowrap sm:text-[11px] sm:tracking-[0.14em]">
                        {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

            </motion.div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="rounded-[24px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] p-4 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl sm:rounded-[32px] sm:p-6">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Session engine
                  </p>
                  <FocusTimer compact />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/45 text-[var(--color-primary-deep)]">
                  <Gauge size={20} />
                </div>
              </div>
              <button
                type="button"
                onClick={resetSession}
                className="mt-5 flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/82 px-4 text-sm font-medium text-[var(--color-dark)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/24"
              >
                Reset session
              </button>
            </div>

            <div className="rounded-[24px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] p-4 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl sm:rounded-[32px] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Today in sequence
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Everything from Personalization, ordered into a startable day.
                  </p>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
                  {completedTaskIds.length}/{taskChecklist.length}
                </span>
              </div>

              <div className="mt-5 max-h-[460px] space-y-3 overflow-y-auto pr-1 sm:max-h-[520px] sm:pr-2">
                <AnimatePresence initial={false}>
                  {taskChecklist.map((task, index) => {
                    const done = completedTaskIds.includes(task.id);

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`flex items-start gap-3 rounded-[18px] border px-3 py-3 shadow-[0_10px_28px_rgba(53,85,63,0.05)] sm:rounded-[22px] sm:px-4 ${
                          done
                            ? "border-[var(--color-primary)]/28 bg-[var(--color-accent)]/42"
                            : "border-white/45 bg-white/74"
                        }`}
                      >
                        <span
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                            done
                              ? "border-[var(--color-primary-deep)] bg-[var(--color-primary-deep)] text-white"
                              : "border-[var(--color-border-strong)] bg-white text-[var(--color-text-secondary)]"
                          }`}
                        >
                          {done ? "✓" : index + 1}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium leading-5 ${
                              done
                                ? "text-[var(--color-dark)]/55 line-through"
                                : "text-[var(--color-dark)]/86"
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            {formatTaskCategory(task.category)} · {task.focusMinutes}m
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {recentMoments.length > 0 ? (
                <p className="mt-5 rounded-[20px] bg-white/64 px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                  {recentMoments[0]}
                </p>
              ) : null}
            </div>
          </motion.aside>
        </div>
      </motion.main>

      <FloatingModal
        open={activeModal === "ready"}
        onClose={() => setActiveModal(null)}
        title="Ready to begin"
        description="This mode keeps things simple: one task, one timer, and enough motion to get you into the work before hesitation grows."
        size="xl"
      >
        <ReadyFlowModal
          nextTask={nextTask}
          selectedMinutes={selectedFocusMinutes}
          onDurationChange={setSelectedFocusMinutes}
          onStart={startPomodoro}
          onPauseResume={pauseOrResumeSession}
          onComplete={completePomodoro}
        />
      </FloatingModal>

      <FloatingModal
        open={activeModal === "stuck"}
        onClose={() => setActiveModal(null)}
        title="Break it down until it feels startable"
        description="This mode turns the task into tiny visible steps. Every micro win counts, and Maui rewards momentum before perfection."
        size="xl"
      >
        <StuckFlowModal
          nextTask={nextTask}
          microSteps={microSteps}
          completedCount={completedCount}
          allMicroStepsDone={allMicroStepsDone}
          reward={reward}
          breakdownTitle={
            nextTask && breakdownTaskId === nextTask.id ? (aiBreakdown?.title ?? "") : ""
          }
          breakdownNote={
            nextTask && breakdownTaskId === nextTask.id ? (aiBreakdown?.contextNote ?? "") : ""
          }
          breakdownError={breakdownError}
          isGeneratingBreakdown={isGeneratingBreakdown}
          onToggleStep={toggleMicroStep}
          onFinishTask={finishBrokenDownTask}
          onResetSteps={() =>
            setCompletedMicroSteps((current) =>
              nextTask
                ? current.filter((stepKey) => !stepKey.startsWith(`${nextTask.id}::`))
                : current
            )
          }
        />
      </FloatingModal>

      <FloatingModal
        open={activeModal === "tired"}
        onClose={() => setActiveModal(null)}
        title="Tell Maui what is going on"
        description="Use a short rant. Maui will detect emotional keywords, reflect the likely state, and guide you toward a gentler next step."
        size="xl"
      >
        <TiredFlowModal
          emotionInput={emotionInput}
          emotionState={emotionState}
          emotionKeywords={emotionKeywords}
          emotionTitle={emotionMessage.title}
          emotionBody={emotionMessage.body}
          burnoutRisk={burnoutRisk}
          crisisFlag={crisisFlag}
          analysisError={emotionAnalysisError}
          isAnalyzing={isAnalyzingEmotion}
          onEmotionChange={setEmotionInput}
          onAnalyze={analyzeEmotion}
        />
      </FloatingModal>

      <RewardToast
        open={rewardToast.open}
        points={rewardToast.points}
        title={rewardToast.title}
      />
    </div>
  );
}
