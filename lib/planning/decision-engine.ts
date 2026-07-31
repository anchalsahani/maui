import type {
  PlanningSystemState,
  TaskItem,
} from "@/components/app/dashboard/types";
import { getAdaptiveTaskScore } from "@/lib/tasks/adaptation";

type PlanningContext = {
  emotionState: "steady" | "stressed" | "tired" | "overwhelmed" | "hopeful";
  burnoutRisk: "low" | "medium" | "high";
};

export interface AdaptiveNextAction {
  task: TaskItem | null;
  block: ReturnType<typeof getNextBlock>;
  progress: number;
  reason: string;
  remainingMinutes: number;
  firstStep: string | null;
  adaptation: {
    status: "protecting" | "adjusting" | "on_track";
    label: string;
    detail: string;
  };
}

export function deriveNextAction({
  tasks,
  taskChecklist,
  planning,
  context,
}: {
  tasks: TaskItem[];
  taskChecklist: TaskItem[];
  planning: PlanningSystemState | null;
  context: PlanningContext;
}): AdaptiveNextAction {
  const schedule = planning?.activePlan?.schedule ?? [];
  const activeSession = planning?.activeSession ?? null;
  const activeBlock = activeSession
    ? schedule.find((block) => block.id === activeSession.blockId) ?? null
    : null;
  const activeTask = activeSession
    ? tasks.find((task) => task.id === activeSession.taskId) ??
      taskChecklist.find((task) => task.id === activeSession.taskId) ??
      null
    : null;
  const nextBlock = getNextBlock(schedule, planning);
  const plannedTask = nextBlock?.taskId
    ? tasks.find((task) => task.id === nextBlock.taskId) ?? null
    : null;
  const task =
    activeTask ??
    plannedTask ??
    [...tasks].sort(
      (a, b) => getAdaptiveTaskScore(b, context) - getAdaptiveTaskScore(a, context)
    )[0] ??
    null;
  const weight = (item: TaskItem) =>
    (item.priority === "high" ? 3 : item.priority === "medium" ? 2 : 1) *
    Math.max(1, item.focusMinutes);
  const totalWeight = taskChecklist.reduce((total, item) => total + weight(item), 0);
  const remainingWeight = tasks.reduce((total, item) => total + weight(item), 0);
  const progress = totalWeight
    ? Math.round(((totalWeight - remainingWeight) / totalWeight) * 100)
    : 0;
  const reason = activeSession
    ? `${activeSession.status === "paused" ? "Paused" : "In progress"}: stay with this block until you choose to finish, pause, or reschedule it.`
    : nextBlock?.reason ??
    (context.burnoutRisk === "high"
      ? "This is the smallest useful next move for your current capacity."
      : planning?.activePlan?.strategy ?? "This is the highest-value task that is still realistic today.");

  const skippedRecently = planning?.memory.some(
    (entry) => entry.type === "task_skipped"
  );
  const protecting = context.burnoutRisk === "high" || context.emotionState === "overwhelmed";
  const adapting = protecting || context.emotionState === "tired" || Boolean(skippedRecently);

  return {
    task,
    block: activeBlock ?? nextBlock ?? null,
    progress,
    reason,
    remainingMinutes: tasks.reduce((total, item) => total + item.focusMinutes, 0),
    firstStep:
      (activeBlock ?? nextBlock)?.firstStep ??
      task?.steps.find((step) => step.trim().length > 0) ??
      null,
    adaptation: protecting
      ? {
          status: "protecting",
          label: "Maui is protecting your capacity",
          detail: "Today is narrowed to the smallest useful next move. Lower-value work can wait.",
        }
      : adapting
        ? {
            status: "adjusting",
            label: "Maui has adjusted the route",
            detail: "Your latest energy and progress signals changed the order or size of what comes next.",
          }
        : {
            status: "on_track",
            label: "Maui is monitoring the plan",
            detail: "Finish or skip a block, check in, or add a task and Maui will reassess from there.",
          },
  };
}

function getNextBlock(
  schedule: NonNullable<PlanningSystemState["activePlan"]>["schedule"],
  planning: PlanningSystemState | null
) {
  return schedule.find((block) => {
    const status = planning?.blockStatus[block.id];
    return block.taskId && status !== "completed" && status !== "skipped";
  }) ?? null;
}
