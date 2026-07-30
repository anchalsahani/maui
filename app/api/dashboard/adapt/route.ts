import { NextResponse } from "next/server";

import type { TaskItem } from "@/components/app/dashboard/types";
import type { PlannerAllocation } from "@/lib/ai/types";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  getDashboardState,
  saveDashboardState,
} from "@/lib/dashboard/state-store";
import {
  adaptTasksToCapacity,
  applyPlannerAllocations,
} from "@/lib/tasks/adaptation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const candidate = body as {
    action?: unknown;
    tasks?: unknown;
    allocations?: unknown;
  };
  const currentState = await getDashboardState(user.id);
  const suppliedTasks = parseTasks(candidate.tasks);
  const baseState =
    currentState ??
    (suppliedTasks.length > 0
      ? {
          tasks: suppliedTasks,
          taskChecklist: suppliedTasks,
          completedTaskIds: [],
          reward: {
            points: 0,
            streak: 0,
            sessionsCompleted: 0,
            microTasksCompleted: 0,
          },
          session: {
            status: "idle" as const,
            title: "",
            mode: "pomodoro" as const,
            focusMinutes: 20,
            runId: 0,
          },
          recentMoments: ["Your workspace is ready."],
          completedMicroSteps: [],
        }
      : null);

  if (!baseState) {
    return NextResponse.json(
      { error: "Open your dashboard once before adapting the plan." },
      { status: 409 }
    );
  }

  if (candidate.action === "apply-plan") {
    const allocations = parseAllocations(candidate.allocations);

    if (allocations.length === 0) {
      return NextResponse.json({ error: "No plan was provided." }, { status: 400 });
    }

    const tasks = applyPlannerAllocations(baseState.tasks, allocations);
    const state = await saveDashboardState(user.id, {
      ...baseState,
      tasks,
      taskChecklist: mergeChecklist(baseState.taskChecklist ?? baseState.tasks, tasks),
      recentMoments: [
        "Applied your latest capacity-aware plan.",
        ...baseState.recentMoments,
      ].slice(0, 6),
    });

    return NextResponse.json({ state });
  }

  if (candidate.action === "add-task") {
    const task = suppliedTasks[0];

    if (!task) {
      return NextResponse.json({ error: "A valid task is required." }, { status: 400 });
    }

    const alreadyExists = baseState.tasks.some((item) => item.id === task.id);
    const tasks = alreadyExists ? baseState.tasks : [task, ...baseState.tasks];
    const checklist = baseState.taskChecklist ?? baseState.tasks;
    const state = await saveDashboardState(user.id, {
      ...baseState,
      tasks,
      taskChecklist: checklist.some((item) => item.id === task.id)
        ? checklist
        : [task, ...checklist],
      recentMoments: [
        `Added "${task.title}" with a startable breakdown.`,
        ...baseState.recentMoments,
      ].slice(0, 6),
    });

    return NextResponse.json({ state });
  }

  if (candidate.action === "survival-on") {
    if (baseState.survivalMode?.active) {
      return NextResponse.json({ state: baseState });
    }

    const originalTasks = baseState.tasks;
    const tasks = adaptTasksToCapacity(originalTasks, {
      emotionState: "overwhelmed",
      burnoutRisk: "high",
    });
    const state = await saveDashboardState(user.id, {
      ...baseState,
      tasks,
      taskChecklist: mergeChecklist(baseState.taskChecklist ?? originalTasks, tasks),
      currentContext: {
        emotionState: "overwhelmed",
        burnoutRisk: "high",
        updatedAt: new Date().toISOString(),
      },
      survivalMode: {
        active: true,
        activatedAt: new Date().toISOString(),
        originalTasks,
      },
      recentMoments: [
        "Survival Mode reduced today to the smallest useful path.",
        ...baseState.recentMoments,
      ].slice(0, 6),
    });

    return NextResponse.json({ state });
  }

  if (candidate.action === "survival-off") {
    const originalTasks = baseState.survivalMode?.originalTasks;
    const state = await saveDashboardState(user.id, {
      ...baseState,
      tasks: originalTasks?.length ? originalTasks : baseState.tasks,
      taskChecklist: originalTasks?.length
        ? mergeChecklist(baseState.taskChecklist ?? baseState.tasks, originalTasks)
        : baseState.taskChecklist,
      survivalMode: null,
      currentContext: {
        emotionState: "steady",
        burnoutRisk: "low",
        updatedAt: new Date().toISOString(),
      },
      recentMoments: [
        "Your full plan is available again.",
        ...baseState.recentMoments,
      ].slice(0, 6),
    });

    return NextResponse.json({ state });
  }

  return NextResponse.json({ error: "Unknown adaptation action." }, { status: 400 });
}

function parseTasks(value: unknown): TaskItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((task): task is TaskItem => {
    if (!task || typeof task !== "object") {
      return false;
    }

    const candidate = task as Partial<TaskItem>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.urgency === "number" &&
      typeof candidate.difficulty === "number" &&
      typeof candidate.focusMinutes === "number" &&
      Array.isArray(candidate.steps)
    );
  });
}

function parseAllocations(value: unknown): PlannerAllocation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((allocation): allocation is PlannerAllocation => {
    if (!allocation || typeof allocation !== "object") {
      return false;
    }

    const candidate = allocation as Partial<PlannerAllocation>;
    return (
      typeof candidate.taskId === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.focusMinutes === "number"
    );
  });
}

function mergeChecklist(checklist: TaskItem[], orderedTasks: TaskItem[]) {
  const updates = new Map(orderedTasks.map((task) => [task.id, task]));
  const active = orderedTasks.map((task) => updates.get(task.id) ?? task);
  const inactive = checklist.filter((task) => !updates.has(task.id));
  return [...active, ...inactive];
}
