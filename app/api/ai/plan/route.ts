import { NextResponse } from "next/server";

import type { TaskItem } from "@/components/app/dashboard/types";
import {
  AIProviderUnavailableError,
  createStructuredResponse,
} from "@/lib/ai/provider";
import type {
  BurnoutRisk,
  PlannerAllocation,
  PlannerRequestInput,
  PlannerResult,
  PlannerScheduleBlock,
} from "@/lib/ai/types";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getDashboardState } from "@/lib/dashboard/state-store";
import { synchronizePlanWithWorkspace } from "@/lib/planning/synchronization";
import { understandTask } from "@/lib/planning/task-intelligence";
import { getRewardSummary, listRewardEvents } from "@/lib/rewards/store";

export const runtime = "nodejs";

const planSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "generatedAt",
    "planningWindow",
    "headline",
    "strategy",
    "todayFocus",
    "assessment",
    "energyForecast",
    "schedule",
    "postponed",
    "reassessment",
    "plan",
  ],
  properties: {
    generatedAt: { type: "string", maxLength: 40 },
    planningWindow: {
      type: "object",
      additionalProperties: false,
      required: ["startTime", "endTime", "totalAvailableMinutes"],
      properties: {
        startTime: { type: "string", maxLength: 40 },
        endTime: { type: "string", maxLength: 40 },
        totalAvailableMinutes: {
          type: "integer",
          minimum: 30,
          maximum: 720,
        },
      },
    },
    headline: { type: "string", maxLength: 120 },
    strategy: { type: "string", maxLength: 420 },
    todayFocus: { type: "string", maxLength: 180 },
    assessment: {
      type: "object",
      additionalProperties: false,
      required: [
        "emotionalState",
        "emotionalSummary",
        "capacitySummary",
        "workloadSummary",
        "keyTradeoff",
        "confidence",
      ],
      properties: {
        emotionalState: {
          type: "string",
          enum: ["steady", "stressed", "tired", "overwhelmed", "hopeful"],
        },
        emotionalSummary: { type: "string", maxLength: 260 },
        capacitySummary: { type: "string", maxLength: 260 },
        workloadSummary: { type: "string", maxLength: 260 },
        keyTradeoff: { type: "string", maxLength: 260 },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
      },
    },
    energyForecast: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["period", "level", "guidance"],
        properties: {
          period: { type: "string", maxLength: 60 },
          level: { type: "string", enum: ["low", "medium", "high"] },
          guidance: { type: "string", maxLength: 180 },
        },
      },
    },
    schedule: {
      type: "array",
      minItems: 2,
      maxItems: 9,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "type",
          "startTime",
          "endTime",
          "title",
          "taskId",
          "durationMinutes",
          "energy",
          "priority",
          "reason",
          "expectedOutcome",
          "firstStep",
          "mission",
          "cognitiveLoad",
          "confidence",
          "smallerVersion",
          "recoveryVersion",
          "conditional",
        ],
        properties: {
          id: { type: "string", maxLength: 50 },
          type: {
            type: "string",
            enum: ["reset", "focus", "recovery", "admin", "commitment", "rest"],
          },
          startTime: { type: "string", maxLength: 40 },
          endTime: { type: "string", maxLength: 40 },
          title: { type: "string", maxLength: 100 },
          taskId: { type: "string", maxLength: 80 },
          durationMinutes: { type: "integer", minimum: 5, maximum: 180 },
          energy: { type: "string", enum: ["low", "medium", "high"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          reason: { type: "string", maxLength: 300 },
          expectedOutcome: { type: "string", maxLength: 220 },
          firstStep: { type: "string", maxLength: 180 },
          mission: { type: "string", maxLength: 180 },
          cognitiveLoad: { type: "string", enum: ["light", "moderate", "heavy"] },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          smallerVersion: { type: "string", maxLength: 200 },
          recoveryVersion: { type: "string", maxLength: 220 },
          conditional: { type: "string", maxLength: 220 },
        },
      },
    },
    postponed: {
      type: "array",
      minItems: 0,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["taskId", "title", "reason", "revisit"],
        properties: {
          taskId: { type: "string", maxLength: 80 },
          title: { type: "string", maxLength: 100 },
          reason: { type: "string", maxLength: 220 },
          revisit: { type: "string", maxLength: 160 },
        },
      },
    },
    reassessment: { type: "string", maxLength: 260 },
    plan: {
      type: "array",
      minItems: 0,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["taskId", "title", "focusMinutes", "intensity", "reason"],
        properties: {
          taskId: { type: "string", maxLength: 80 },
          title: { type: "string", maxLength: 100 },
          focusMinutes: { type: "integer", minimum: 5, maximum: 90 },
          intensity: {
            type: "string",
            enum: ["light", "balanced", "deep"],
          },
          reason: { type: "string", maxLength: 220 },
        },
      },
    },
  },
};

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as PlannerRequestInput;
  const dashboardState = await getDashboardState(user.id);
  const rewardEvents = await listRewardEvents(user.id);
  const completedTaskIds = new Set(dashboardState?.completedTaskIds ?? []);
  const tasks = mergePlanningTasks(
    mapGeneratedTasks(user.studyProfile?.generatedTasks ?? []),
    dashboardState?.tasks ?? [],
    body.tasks ?? []
  ).filter((task) => !completedTaskIds.has(task.id));
  const now = getPlanningStart(body.currentTime);
  const availableMinutes = clampNumber(body.availableMinutes, 60, 720, 300);
  const planningEnd = new Date(now.getTime() + availableMinutes * 60_000);
  const historicalSignals = {
    recentMoments: dashboardState?.recentMoments?.slice(0, 8) ?? [],
    activeSession: dashboardState?.session?.status ?? "idle",
    completedTaskIds: dashboardState?.completedTaskIds?.slice(0, 20) ?? [],
    currentContext: dashboardState?.currentContext ?? null,
    rewardSummary: getRewardSummary(rewardEvents),
    recentCompletions: rewardEvents.slice(0, 12).map((event) => ({
      type: event.type,
      title: event.title,
      completedAt: event.createdAt,
    })),
    planningMemory: dashboardState?.planning?.memory?.slice(0, 10) ?? [],
  };
  const context = {
    now: now.toISOString(),
    planningEnd: planningEnd.toISOString(),
    timezone:
      typeof body.timezone === "string" && body.timezone
        ? body.timezone.slice(0, 80)
        : "UTC",
    availableMinutes,
    emotionState:
      body.emotionState ??
      dashboardState?.currentContext?.emotionState ??
      "steady",
    energyLevel:
      body.energyLevel ??
      inferEnergyLevel(
        body.emotionState ?? dashboardState?.currentContext?.emotionState
      ),
    burnoutRisk:
      body.burnoutRisk ??
      dashboardState?.currentContext?.burnoutRisk ??
      "low",
    userNote:
      typeof body.todayNotes === "string" ? body.todayNotes.slice(0, 3000) : "",
    emotionalHistory:
      typeof body.rantContext === "string" ? body.rantContext.slice(0, 1200) : "",
    survey: user.survey,
    profile: user.studyProfile
      ? {
          studying: user.studyProfile.studying,
          goal: user.studyProfile.goal,
          preferences: user.studyProfile.preferences,
          fixedCommitments: user.studyProfile.fixedCommitments,
          choresAndErrands: user.studyProfile.choresAndErrands,
          wellbeingAndFun: user.studyProfile.wellbeingAndFun,
          planningNotes: user.studyProfile.planningNotes,
        }
      : null,
    tasks: tasks.slice(0, 24).map((task) => enrichTaskForPlanning(task, getSkippedCount(task, dashboardState?.planning?.memory ?? []))),
    historicalSignals,
  };
  const fallback = buildContextualSchedule(tasks, context);
  const trigger =
    typeof body.replanTrigger === "string" && body.replanTrigger.trim()
      ? body.replanTrigger.trim().slice(0, 80)
      : "planner";
  const synchronize = async (plan: PlannerResult) => {
    const state = await synchronizePlanWithWorkspace({
      userId: user.id,
      plan,
      tasks,
      trigger,
      context: {
        emotionState: context.emotionState,
        burnoutRisk: context.burnoutRisk,
        energyLevel: context.energyLevel,
      },
    });

    return NextResponse.json({
      plan,
      revision: state.planning?.revision ?? 0,
      state,
    });
  };

  if (tasks.length === 0) {
    return synchronize(fallback);
  }

  try {
    const generated = await createStructuredResponse<PlannerResult>({
      name: "maui_daily_schedule",
      schema: planSchema,
      instructions: buildPlannerInstructions(),
      input: context,
      maxOutputTokens: 4200,
      thinkingBudget: 1800,
      reasoningEffort: "medium",
    });
    const plan = normalizeGeneratedPlan(generated, fallback, now, planningEnd);

    return synchronize(plan);
  } catch (error) {
    if (!(error instanceof AIProviderUnavailableError)) {
      console.error("Daily schedule generation failed", error);
    }

    return synchronize(fallback);
  }
}

function buildPlannerInstructions() {
  return [
    "You are Maui, an emotionally intelligent daily planning assistant for people with ADHD and executive dysfunction.",
    "Your job is to answer one question: given everything happening today, what is the smartest realistic way to spend the available time?",
    "Think through deadline proximity, fixed commitments, current time, energy, emotional state, burnout risk, task progress, recent completion behavior, interruption risk, and the user's preferred focus style.",
    "Use planningMemory as continuity, not as a script. If it shows a task was postponed and is now scheduled, explain that return plainly. Never invent past decisions.",
    "Create a chronological schedule using the exact ISO planning window in the input. Every block must have real ISO start and end times, must not overlap, and must fit inside the window.",
    "Treat user task titles as raw inputs, never as the final user-facing plan. For every task block create a mission that describes the meaningful outcome in plain language, rather than repeating the task title.",
    "For every task block return mission, cognitiveLoad, confidence, firstStep, smallerVersion, and recoveryVersion. These are decisions Maui makes, not generic encouragement. Use progressively smaller first steps for high difficulty, avoidance, tiredness, overwhelm, or high burnout risk.",
    "When a task is broad, make this planning window a small milestone with a clear stopping point; detailed microsteps remain available in Task Breakdown.",
    "Do not diagnose burnout. Burnout Check-In owns diagnosis. Use burnout risk only to reduce load, shorten blocks, add recovery, or postpone work.",
    "Explain each trade-off naturally: why this task comes first, why its duration fits current capacity, what is deliberately postponed, and when to reassess.",
    "Avoid generic filler such as drink water, stand up, open the task, clear your desk, work badly, or pick one chore unless the user explicitly asked for it.",
    "Do not shame, moralize, or impose arbitrary rules about phones, games, or rest.",
    "Keep reasoning concise, specific, and grounded in the supplied facts. Acknowledge uncertainty when calendar or deadline details are incomplete.",
    "The plan array is only a machine-readable ordering of scheduled task blocks for dashboard application. It must match focus or admin blocks in the schedule.",
    "Return only schema-valid JSON.",
  ].join(" ");
}

function buildContextualSchedule(
  tasks: TaskItem[],
  context: {
    now: string;
    planningEnd: string;
    availableMinutes: number;
    emotionState: string;
    energyLevel: "low" | "medium" | "high";
    burnoutRisk: BurnoutRisk;
    userNote: string;
    historicalSignals: {
      recentMoments: string[];
      activeSession: string;
      completedTaskIds: string[];
      currentContext: unknown;
      rewardSummary: { streak: number; sessionsCompleted: number };
      recentCompletions: Array<{
        type: string;
        title: string;
        completedAt: string;
      }>;
      planningMemory: Array<{
        type?: string;
        taskId?: string;
        summary: string;
        createdAt: string;
      }>;
    };
  }
): PlannerResult {
  const start = new Date(context.now);
  const end = new Date(context.planningEnd);
  const emotionalState = normalizeEmotion(context.emotionState);
  const risk = context.burnoutRisk;
  const stoppedRecently = context.historicalSignals.recentMoments.some((moment) =>
    /stopped midway|paused|stuck|overwhelmed/i.test(moment)
  );
  const scoredTasks = [...tasks]
    .map((task) => ({ task, score: getDailyTaskScore(task, context.energyLevel, start) }))
    .sort((a, b) => b.score - a.score);
  const blockMinutes =
    risk === "high"
      ? 20
      : context.energyLevel === "low"
        ? 25
        : context.energyLevel === "high"
          ? 45
          : 35;
  const schedule: PlannerScheduleBlock[] = [];
  let cursor = new Date(start);

  if (
    emotionalState === "overwhelmed" ||
    emotionalState === "tired" ||
    stoppedRecently
  ) {
    schedule.push(
      createScheduleBlock({
        index: schedule.length,
        cursor,
        minutes: 10,
        type: "reset",
        title: "Transition into the day",
        energy: "low",
        priority: "medium",
        reason:
          emotionalState === "overwhelmed"
            ? "You reported overload, so the schedule starts with a short transition instead of demanding immediate concentration."
            : "Recent energy or interruption signals suggest that an abrupt start would be less reliable than a brief transition.",
        expectedOutcome:
          "Arrive at the first work block with less resistance and without using up the day on preparation.",
      })
    );
    cursor = new Date(cursor.getTime() + 10 * 60_000);
  }

  const taskLimit = risk === "high" ? 1 : context.energyLevel === "low" ? 2 : 3;
  const selected = scoredTasks.slice(0, taskLimit);

  selected.forEach(({ task }, index) => {
    const remaining = Math.floor((end.getTime() - cursor.getTime()) / 60_000);

    if (remaining < 20) {
      return;
    }

    const focusMinutes = Math.min(blockMinutes, task.focusMinutes, remaining);
    const deadlineReason = describeDeadline(task.deadline, start);
    const intelligence = understandTask(task, getSkippedCount(task, context.historicalSignals.planningMemory));
    const block = createScheduleBlock({
      index: schedule.length,
      cursor,
      minutes: focusMinutes,
      type:
        task.category === "commitment"
          ? "commitment"
          : task.category === "chore"
            ? "admin"
            : task.category === "wellbeing"
              ? "recovery"
              : "focus",
      title: task.title,
      taskId: task.id,
      energy:
        task.difficulty >= 7
          ? "high"
          : task.difficulty <= 3
            ? "low"
            : "medium",
      priority: task.priority ?? (task.urgency >= 8 ? "high" : "medium"),
      reason: buildTaskReason(task, deadlineReason, context.energyLevel, index),
      expectedOutcome: buildExpectedOutcome(task, focusMinutes),
      firstStep: intelligence.firstStep,
      mission: intelligence.mission,
      cognitiveLoad: intelligence.cognitiveLoad,
      confidence: intelligence.avoidanceRisk === "high" ? "medium" : "high",
      smallerVersion: intelligence.smallerVersion,
      recoveryVersion: intelligence.recoveryVersion,
      conditional:
        index > 0
          ? "Continue only if your energy still matches the level shown; otherwise move this block to the next planning window."
          : "",
    });
    schedule.push(block);
    cursor = new Date(cursor.getTime() + focusMinutes * 60_000);

    const remainingAfter = Math.floor((end.getTime() - cursor.getTime()) / 60_000);

    if (index < selected.length - 1 && remainingAfter >= 20) {
      const recoveryMinutes = risk === "high" ? 15 : 10;
      schedule.push(
        createScheduleBlock({
          index: schedule.length,
          cursor,
          minutes: recoveryMinutes,
          type: "recovery",
          title: "Recovery buffer",
          energy: "low",
          priority: "medium",
          reason:
            "This buffer prevents one focus block from consuming the capacity reserved for the rest of the plan.",
          expectedOutcome:
            "Reach the next block with a clear stopping point instead of carrying unfinished momentum into it.",
        })
      );
      cursor = new Date(cursor.getTime() + recoveryMinutes * 60_000);
    }
  });

  const unscheduledMinutes = Math.floor((end.getTime() - cursor.getTime()) / 60_000);

  if (unscheduledMinutes >= 20) {
    const closeMinutes = Math.min(30, unscheduledMinutes);
    schedule.push(
      createScheduleBlock({
        index: schedule.length,
        cursor,
        minutes: closeMinutes,
        type: "rest",
        title: "Protected open time",
        energy: "low",
        priority: "low",
        reason:
          "The schedule leaves capacity unclaimed so delays or lower-than-expected energy do not turn the plan into failure.",
        expectedOutcome:
          "Finish the planning window with room to recover, catch up, or stop without guilt.",
      })
    );
  }

  const postponed = scoredTasks.slice(taskLimit).map(({ task }) => ({
    taskId: task.id,
    title: task.title,
    reason: `${task.title} ranks below today's selected work after considering deadline pressure, difficulty, and current capacity.`,
    revisit: "Reassess in the next planning window or sooner if a deadline changes.",
  }));
  const allocations: PlannerAllocation[] = schedule
    .filter((block) => block.taskId)
    .map((block) => ({
      taskId: block.taskId,
      title: block.title,
      focusMinutes: block.durationMinutes,
      intensity:
        block.energy === "high"
          ? "deep"
          : block.energy === "low"
            ? "light"
            : "balanced",
      reason: block.reason,
    }));
  const firstTask = selected[0]?.task;

  return {
    generatedAt: start.toISOString(),
    planningWindow: {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      totalAvailableMinutes: context.availableMinutes,
    },
    headline:
      emotionalState === "overwhelmed"
        ? "A protected day with one clear priority."
        : firstTask
          ? `${firstTask.title} gets your best available attention.`
          : "Today can stay intentionally open.",
    strategy:
      firstTask
        ? `The plan protects your ${context.energyLevel} energy while giving the strongest available block to ${firstTask.title}. Lower-value work is postponed rather than allowed to compete for attention.`
        : "There are no active tasks to schedule, so Maui is preserving capacity instead of inventing busywork.",
    todayFocus: firstTask?.title ?? "Recovery and clarity",
    assessment: {
      emotionalState,
      emotionalSummary: getEmotionalSummary(emotionalState, context.userNote),
      capacitySummary: getCapacitySummary(context.energyLevel, risk, blockMinutes),
      workloadSummary:
        tasks.length > taskLimit
          ? `${tasks.length} active tasks exceed the ${taskLimit} that fit today's capacity, so the remainder are explicitly postponed.`
          : `${tasks.length} active task${tasks.length === 1 ? "" : "s"} fit inside the current planning window without filling every minute.`,
      keyTradeoff: firstTask
        ? `Progress on ${firstTask.title} is being protected at the cost of delaying lower-pressure work.`
        : "Open capacity is more useful than a schedule filled with invented tasks.",
      confidence: tasks.some((task) => task.deadline) ? "high" : "medium",
    },
    energyForecast: buildEnergyForecast(context.energyLevel, risk),
    schedule,
    postponed,
    reassessment:
      "Reassess after the first focus block. If energy drops by one level, shorten the next block or move it to the next planning window without changing the priority decision.",
    plan: allocations,
  };
}

function createScheduleBlock({
  index,
  cursor,
  minutes,
  type,
  title,
  taskId = "",
  energy,
  priority,
  reason,
  expectedOutcome,
  firstStep,
  mission,
  cognitiveLoad,
  confidence,
  smallerVersion,
  recoveryVersion,
  conditional = "",
}: {
  index: number;
  cursor: Date;
  minutes: number;
  type: PlannerScheduleBlock["type"];
  title: string;
  taskId?: string;
  energy: PlannerScheduleBlock["energy"];
  priority: PlannerScheduleBlock["priority"];
  reason: string;
  expectedOutcome: string;
  firstStep?: string;
  mission?: string;
  cognitiveLoad?: PlannerScheduleBlock["cognitiveLoad"];
  confidence?: PlannerScheduleBlock["confidence"];
  smallerVersion?: string;
  recoveryVersion?: string;
  conditional?: string;
}): PlannerScheduleBlock {
  const end = new Date(cursor.getTime() + minutes * 60_000);

  return {
    id: `block-${index + 1}`,
    type,
    startTime: cursor.toISOString(),
    endTime: end.toISOString(),
    title,
    taskId,
    durationMinutes: minutes,
    energy,
    priority,
    reason,
    expectedOutcome,
    firstStep,
    mission,
    cognitiveLoad,
    confidence,
    smallerVersion,
    recoveryVersion,
    conditional,
  };
}

function normalizeGeneratedPlan(
  generated: PlannerResult,
  fallback: PlannerResult,
  start: Date,
  end: Date
) {
  if (!generated || !Array.isArray(generated.schedule)) {
    return fallback;
  }

  const schedule = [...generated.schedule]
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .map((block) => ({
      ...block,
      durationMinutes: Math.round(
        (new Date(block.endTime).getTime() -
          new Date(block.startTime).getTime()) /
          60_000
      ),
    }));
  let previousEnd = start.getTime();

  for (const block of schedule) {
    const blockStart = new Date(block.startTime).getTime();
    const blockEnd = new Date(block.endTime).getTime();

    if (
      !Number.isFinite(blockStart) ||
      !Number.isFinite(blockEnd) ||
      blockStart < start.getTime() - 60_000 ||
      blockEnd > end.getTime() + 60_000 ||
      blockEnd <= blockStart ||
      blockStart < previousEnd
    ) {
      return fallback;
    }

    previousEnd = blockEnd;
  }

  if (schedule.length < 2) {
    return fallback;
  }

  return {
    ...generated,
    generatedAt: start.toISOString(),
    planningWindow: {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      totalAvailableMinutes: Math.round(
        (end.getTime() - start.getTime()) / 60_000
      ),
    },
    schedule,
  };
}

function mergePlanningTasks(...groups: TaskItem[][]) {
  const tasks = new Map<string, TaskItem>();

  for (const group of groups) {
    for (const task of group) {
      if (!task || task.status === "done" || !task.id || !task.title) {
        continue;
      }

      const key = task.id || task.title.toLowerCase();
      tasks.set(key, { ...(tasks.get(key) ?? {}), ...task });
    }
  }

  return [...tasks.values()];
}

function mapGeneratedTasks(
  tasks: Array<{
    id: string;
    title: string;
    subject: string;
    category?: string;
    priority: "low" | "medium" | "high";
    difficulty: "easy" | "medium" | "hard";
    estimatedMinutes: number;
    progress: number;
    deadline: string | null;
    status: "todo" | "in_progress" | "done";
  }>
): TaskItem[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    subject: task.subject,
    category: task.category,
    status: task.status,
    priority: task.priority,
    urgency: task.priority === "high" ? 9 : task.priority === "medium" ? 6 : 4,
    difficulty:
      task.difficulty === "hard" ? 7 : task.difficulty === "medium" ? 5 : 3,
    deadlineWeight: task.deadline ? 3 : 1,
    focusMinutes: Math.min(90, Math.max(15, task.estimatedMinutes)),
    progress: task.progress,
    deadline: task.deadline,
    steps: [],
  }));
}

function enrichTaskForPlanning(task: TaskItem, skippedCount: number) {
  return {
    ...task,
    deadlineProximity: describeDeadline(task.deadline, new Date()),
    estimatedRemainingMinutes: Math.max(
      5,
      Math.round(task.focusMinutes * (1 - (task.progress ?? 0) / 100))
    ),
    intelligence: understandTask(task, skippedCount),
  };
}

function getSkippedCount(
  task: TaskItem,
  memory: Array<{ type?: string; taskId?: string; summary?: string }>
) {
  return memory.filter(
    (entry) =>
      entry.type === "task_skipped" &&
      (entry.taskId === task.id || entry.summary?.includes(task.title))
  ).length;
}

function getDailyTaskScore(
  task: TaskItem,
  energy: "low" | "medium" | "high",
  now: Date
) {
  const deadline = getDeadlineScore(task.deadline, now);
  const priority = { high: 8, medium: 4, low: 1 }[task.priority ?? "medium"];
  const progressBoost =
    typeof task.progress === "number" && task.progress > 0 && task.progress < 100
      ? 2
      : 0;
  const energyFit =
    energy === "low"
      ? Math.max(0, 7 - task.difficulty)
      : energy === "high"
        ? task.difficulty * 0.6
        : 2;

  return task.urgency * 1.4 + priority + deadline + progressBoost + energyFit;
}

function getDeadlineScore(deadline: string | null | undefined, now: Date) {
  if (!deadline) {
    return 0;
  }

  const due = new Date(deadline);

  if (!Number.isFinite(due.getTime())) {
    return 3;
  }

  const days = (due.getTime() - now.getTime()) / 86_400_000;

  if (days <= 0) return 12;
  if (days <= 1) return 10;
  if (days <= 3) return 7;
  if (days <= 7) return 4;
  return 1;
}

function describeDeadline(
  deadline: string | null | undefined,
  now: Date
) {
  if (!deadline) {
    return "No explicit deadline is available.";
  }

  const due = new Date(deadline);

  if (!Number.isFinite(due.getTime())) {
    return `The recorded deadline is ${deadline}.`;
  }

  const days = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);

  if (days <= 0) return "The deadline is due now or overdue.";
  if (days === 1) return "The deadline is within one day.";
  return `The deadline is approximately ${days} days away.`;
}

function buildTaskReason(
  task: TaskItem,
  deadlineReason: string,
  energy: "low" | "medium" | "high",
  index: number
) {
  if (task.deadline || task.priority === "high") {
    return `${deadlineReason} Maui is giving it ${index === 0 ? "the first" : "an early"} decision slot because delay raises its cost; the block is capped to fit ${energy} energy rather than asking for full completion.`;
  }

  if ((task.progress ?? 0) > 0) {
    return `You already have momentum on this task. Returning to it costs less attention than starting a completely new track, so it fits this ${energy}-energy window.`;
  }

  return `Maui chose this over the remaining work because its urgency, difficulty, and energy fit create the best return for this window. The bounded block protects capacity for the rest of the day.`;
}

function buildExpectedOutcome(task: TaskItem, minutes: number) {
  if ((task.progress ?? 0) > 0) {
    return `Move ${task.title} beyond its current ${task.progress}% progress and finish with a visible stopping point after ${minutes} minutes.`;
  }

  return `Make a meaningful ${minutes}-minute advance on ${task.title} without treating full completion as the only successful outcome.`;
}

function buildEnergyForecast(
  energy: "low" | "medium" | "high",
  risk: BurnoutRisk
) {
  return [
    {
      period: "Opening block",
      level: energy,
      guidance:
        energy === "low"
          ? "Use the shortest meaningful focus block while attention is still available."
          : "Give the highest-value task the clearest available attention.",
    },
    {
      period: "Middle of the plan",
      level: risk === "high" || energy === "low" ? ("low" as const) : ("medium" as const),
      guidance:
        "Expect some drop after focused work; the schedule includes recovery before another demand.",
    },
    {
      period: "Closing window",
      level: "low" as const,
      guidance:
        "Keep the end flexible so delays or reduced energy do not invalidate the day.",
    },
  ];
}

function getEmotionalSummary(emotion: string, note: string) {
  const context = note.trim()
    ? " Your note adds specific context, so the schedule treats that signal as current rather than assuming a typical day."
    : "";

  switch (emotion) {
    case "overwhelmed":
      return `Choice pressure appears high. The plan reduces simultaneous decisions and makes postponement explicit.${context}`;
    case "stressed":
      return `Deadline pressure is competing with available attention. The plan acknowledges urgency without filling every minute.${context}`;
    case "tired":
      return `Energy appears limited, so the schedule uses shorter commitments and protects recovery between demands.${context}`;
    case "hopeful":
      return `There is useful momentum today, but the plan keeps boundaries around it so optimism does not become overcommitment.${context}`;
    default:
      return `No strong distress signal is dominating the plan, so priorities and deadline pressure can lead while capacity remains protected.${context}`;
  }
}

function getCapacitySummary(
  energy: "low" | "medium" | "high",
  risk: BurnoutRisk,
  blockMinutes: number
) {
  return `${energy[0].toUpperCase()}${energy.slice(1)} energy and ${risk} overload risk support focus blocks of about ${blockMinutes} minutes, followed by an explicit reassessment rather than an automatic push into more work.`;
}

function inferEnergyLevel(emotion: string | undefined) {
  if (emotion === "tired" || emotion === "overwhelmed") return "low";
  if (emotion === "hopeful") return "high";
  return "medium";
}

function normalizeEmotion(value: string) {
  if (
    value === "steady" ||
    value === "stressed" ||
    value === "tired" ||
    value === "overwhelmed" ||
    value === "hopeful"
  ) {
    return value;
  }

  return "steady";
}

function getPlanningStart(value: unknown) {
  const parsed =
    typeof value === "string" && value ? new Date(value) : new Date();
  const start = Number.isFinite(parsed.getTime()) ? parsed : new Date();
  start.setSeconds(0, 0);
  const remainder = start.getMinutes() % 5;

  if (remainder > 0) {
    start.setMinutes(start.getMinutes() + (5 - remainder));
  }

  return start;
}

function clampNumber(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number
) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, Math.round(value)))
    : fallback;
}
