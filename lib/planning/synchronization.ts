import "server-only";

import type {
  EmotionState,
  PersistedDashboardState,
  PlanningMemoryEntry,
  PlanningSystemState,
  TaskItem,
} from "@/components/app/dashboard/types";
import type { BurnoutRisk, PlannerResult } from "@/lib/ai/types";
import {
  getDashboardState,
  saveDashboardState,
} from "@/lib/dashboard/state-store";
import { applyPlannerAllocations } from "@/lib/tasks/adaptation";
import { getConsistencyMetrics, recordProductiveDay } from "@/lib/dashboard/consistency";

export type PlanningEventType =
  | "focus_started"
  | "task_completed"
  | "focus_completed"
  | "task_skipped"
  | "context_changed";

export interface PlanningEventInput {
  type: PlanningEventType;
  taskId?: string;
  title?: string;
  durationMinutes?: number;
  emotionState?: EmotionState;
  burnoutRisk?: BurnoutRisk;
  energyLevel?: "low" | "medium" | "high";
  rewardPoints?: number;
  incrementStreak?: boolean;
  incrementSessions?: boolean;
  blockId?: string;
  runId?: number;
  startedAt?: string;
  endsAt?: string;
  summary?: string;
}

interface SynchronizePlanInput {
  userId: string;
  plan: PlannerResult;
  tasks: TaskItem[];
  trigger: string;
  context?: {
    emotionState: EmotionState;
    burnoutRisk: BurnoutRisk;
    energyLevel: "low" | "medium" | "high";
  };
}

const defaultReward = {
  points: 0,
  streak: 0,
  sessionsCompleted: 0,
  microTasksCompleted: 0,
  activityDays: [],
  longestStreak: 0,
};

const defaultSession = {
  status: "idle" as const,
  title: "",
  mode: "pomodoro" as const,
  focusMinutes: 20,
  runId: 0,
};

export async function synchronizePlanWithWorkspace({
  userId,
  plan,
  tasks,
  trigger,
  context,
}: SynchronizePlanInput) {
  const existing = await getDashboardState(userId);
  const base = getBaseState(existing, tasks);
  const now = new Date().toISOString();
  const previousPlanning = base.planning;
  const planningContext = {
    emotionState: context?.emotionState ?? plan.assessment.emotionalState,
    burnoutRisk: context?.burnoutRisk ?? base.currentContext?.burnoutRisk ?? "low",
    energyLevel: context?.energyLevel ?? inferEnergy(plan),
    updatedAt: now,
  };
  const activeTasks = applyPlannerAllocations(
    tasks,
    plan.plan
  );
  const studyBlocks = plan.schedule.filter(
    (block) => block.type === "focus" && Boolean(block.taskId)
  );
  const currentGoal = studyBlocks[0]?.title ?? null;
  const previouslyPostponed = new Set(
    previousPlanning?.activePlan?.postponed.map((item) => item.taskId) ?? []
  );
  const returnedItems = plan.schedule.filter(
    (block) => block.taskId && previouslyPostponed.has(block.taskId)
  );
  const memory = appendMemory(previousPlanning?.memory ?? [], [
    makeMemory("plan_created", `Maui refreshed today’s plan: ${plan.headline}`, now),
    ...returnedItems.slice(0, 2).map((block) =>
      makeMemory(
        "plan_created",
        `${block.title} returned to the plan because today’s capacity can support it.`,
        now,
        block.taskId
      )
    ),
    ...plan.postponed.slice(0, 2).map((item) =>
      makeMemory(
        "plan_created",
        `${item.title} was deliberately postponed: ${item.reason}`,
        now,
        item.taskId
      )
    ),
  ]);
  const planning: PlanningSystemState = {
    revision: (previousPlanning?.revision ?? 0) + 1,
    activePlan: plan,
    blockStatus: Object.fromEntries(
      plan.schedule.map((block) => [block.id, "upcoming"])
    ),
    context: planningContext,
    memory,
    lastTrigger: trigger,
    study: {
      plannedMinutes: studyBlocks.reduce(
        (total, block) => total + block.durationMinutes,
        0
      ),
      completedMinutes: previousPlanning?.study.completedMinutes ?? 0,
      currentGoal,
    },
  };
  const state: PersistedDashboardState = {
    ...base,
    tasks: activeTasks,
    taskChecklist: mergeChecklist(base.taskChecklist ?? base.tasks, activeTasks),
    currentContext: {
      emotionState: planningContext.emotionState,
      burnoutRisk: planningContext.burnoutRisk,
      updatedAt: now,
    },
    planning,
    recentMoments: [
      `Maui updated the shared plan: ${plan.todayFocus}.`,
      ...base.recentMoments,
    ].slice(0, 8),
  };

  return saveDashboardState(userId, state);
}

export async function recordPlanningEvent(
  userId: string,
  input: PlanningEventInput
) {
  const existing = await getDashboardState(userId);

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const previousPlanning = existing.planning;
  const currentContext = {
    emotionState:
      input.emotionState ??
      previousPlanning?.context.emotionState ??
      existing.currentContext?.emotionState ??
      "steady",
    burnoutRisk:
      input.burnoutRisk ??
      previousPlanning?.context.burnoutRisk ??
      existing.currentContext?.burnoutRisk ??
      "low",
    energyLevel:
      input.energyLevel ?? previousPlanning?.context.energyLevel ?? "medium",
    updatedAt: now,
  };
  const task = input.taskId
    ? existing.tasks.find((item) => item.id === input.taskId)
    : undefined;
  const title = input.title?.trim() || task?.title || "A task";
  const blockStatus = { ...(previousPlanning?.blockStatus ?? {}) };

  if (input.type === "focus_started" && input.blockId) {
    blockStatus[input.blockId] = "in_progress";
  }

  if (input.taskId && previousPlanning?.activePlan) {
    previousPlanning.activePlan.schedule
      .filter((block) => block.taskId === input.taskId)
      .forEach((block) => {
        blockStatus[block.id] =
          input.type === "task_skipped" ? "skipped" : "completed";
      });
  }

  const tasks =
    input.type === "task_completed" && input.taskId
      ? existing.tasks.filter((item) => item.id !== input.taskId)
      : existing.tasks;
  const completedTaskIds =
    input.type === "task_completed" && input.taskId
      ? existing.completedTaskIds?.includes(input.taskId)
        ? existing.completedTaskIds
        : [...(existing.completedTaskIds ?? []), input.taskId]
      : existing.completedTaskIds ?? [];
  const duration = clampDuration(input.durationMinutes);
  const rewardPoints = clampRewardPoints(input.rewardPoints);
  const isProductiveEvent = input.type === "task_completed" || input.type === "focus_completed";
  const activityDays = isProductiveEvent
    ? recordProductiveDay(existing.reward.activityDays ?? [])
    : existing.reward.activityDays ?? [];
  const consistency = getConsistencyMetrics(activityDays);
  const reward = {
    ...existing.reward,
    points: existing.reward.points + rewardPoints,
    streak: consistency.currentStreak,
    longestStreak: Math.max(existing.reward.longestStreak ?? 0, consistency.longestStreak),
    activityDays,
    sessionsCompleted:
      existing.reward.sessionsCompleted + (input.incrementSessions ? 1 : 0),
  };
  const existingStudy = previousPlanning?.study;
  const memorySummary =
    input.summary?.trim() ||
    getDefaultEventSummary(input.type, title, currentContext.emotionState);
  const memory = appendMemory(previousPlanning?.memory ?? [], [
    makeMemory(input.type, memorySummary, now, input.taskId),
  ]);
  const planning: PlanningSystemState | undefined = previousPlanning
    ? {
        ...previousPlanning,
        revision: previousPlanning.revision + 1,
        blockStatus,
        activeSession:
          input.type === "focus_started" && input.taskId && input.blockId && input.startedAt && input.endsAt
            ? {
                blockId: input.blockId,
                taskId: input.taskId,
                title,
                focusMinutes: duration,
                status: "active",
                startedAt: input.startedAt,
                endsAt: input.endsAt,
                runId: input.runId ?? 0,
              }
            : input.type === "task_completed" || input.type === "focus_completed" || input.type === "task_skipped"
              ? null
              : previousPlanning.activeSession ?? null,
        context: currentContext,
        memory,
        lastTrigger: input.type,
        study: {
          plannedMinutes: existingStudy?.plannedMinutes ?? 0,
          completedMinutes:
            (existingStudy?.completedMinutes ?? 0) +
            (input.type === "focus_completed" || input.type === "task_completed"
              ? duration
              : 0),
          currentGoal:
            input.type === "task_completed" &&
            existingStudy?.currentGoal === title
              ? previousPlanning.activePlan
                ? getNextStudyGoal(previousPlanning.activePlan, input.taskId ?? "")
                : null
              : existingStudy?.currentGoal ?? null,
        },
      }
    : undefined;
  const state: PersistedDashboardState = {
    ...existing,
    tasks,
    taskChecklist: mergeChecklist(existing.taskChecklist ?? existing.tasks, tasks),
    completedTaskIds,
    reward,
    currentContext: {
      emotionState: currentContext.emotionState,
      burnoutRisk: currentContext.burnoutRisk,
      updatedAt: now,
    },
    planning,
    recentMoments: [memorySummary, ...existing.recentMoments].slice(0, 8),
  };

  return saveDashboardState(userId, state);
}

function getBaseState(
  state: PersistedDashboardState | null,
  tasks: TaskItem[]
): PersistedDashboardState {
  if (state) {
    return state;
  }

  return {
    tasks,
    taskChecklist: tasks,
    completedTaskIds: [],
    reward: defaultReward,
    session: defaultSession,
    recentMoments: ["Your shared planning workspace is ready."],
    completedMicroSteps: [],
  };
}

function mergeChecklist(checklist: TaskItem[], activeTasks: TaskItem[]) {
  const updates = new Map(activeTasks.map((task) => [task.id, task]));
  const active = activeTasks.map((task) => updates.get(task.id) ?? task);
  const completed = checklist.filter((task) => !updates.has(task.id));

  return [...active, ...completed];
}

function appendMemory(
  existing: PlanningMemoryEntry[],
  additions: PlanningMemoryEntry[]
) {
  return [...additions, ...existing]
    .filter((entry, index, entries) =>
      entries.findIndex(
        (candidate) => candidate.summary === entry.summary && candidate.type === entry.type
      ) === index
    )
    .slice(0, 30);
}

function makeMemory(
  type: PlanningMemoryEntry["type"],
  summary: string,
  createdAt: string,
  taskId?: string
): PlanningMemoryEntry {
  return {
    id: `${type}-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    summary,
    createdAt,
    ...(taskId ? { taskId } : {}),
  };
}

function inferEnergy(plan: PlannerResult): "low" | "medium" | "high" {
  const opening = plan.energyForecast[0]?.level;
  return opening === "low" || opening === "high" ? opening : "medium";
}

function clampDuration(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(180, Math.max(0, Math.round(value)));
}

function clampRewardPoints(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(20, Math.max(0, Math.round(value)));
}

function getDefaultEventSummary(
  type: PlanningEventType,
  title: string,
  emotion: EmotionState
) {
  switch (type) {
    case "focus_started":
      return `Started a focus block for ${title}.`;
    case "task_completed":
      return `Completed ${title}. Maui can now reconsider the time that opened up.`;
    case "focus_completed":
      return `Completed a focus block for ${title}.`;
    case "task_skipped":
      return `Paused ${title}; Maui will make the next plan less demanding.`;
    case "context_changed":
      return `Planning context changed to ${emotion}; Maui is protecting capacity accordingly.`;
  }
}

function getNextStudyGoal(plan: PlannerResult, completedTaskId: string) {
  return (
    plan.schedule.find(
      (block) => block.type === "focus" && block.taskId !== completedTaskId
    )?.title ?? null
  );
}
