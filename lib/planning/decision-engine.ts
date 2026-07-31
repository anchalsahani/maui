import type {
  PlanningSystemState,
  TaskItem,
} from "@/components/app/dashboard/types";
import { getAdaptiveTaskScore } from "@/lib/tasks/adaptation";

type PlanningContext = {
  emotionState: "steady" | "stressed" | "tired" | "overwhelmed" | "hopeful";
  burnoutRisk: "low" | "medium" | "high";
};

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
}) {
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
  const nextBlock = schedule.find((block) => {
    const status = planning?.blockStatus[block.id];
    return block.taskId && status !== "completed" && status !== "skipped";
  });
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

  return {
    task,
    block: activeBlock ?? nextBlock ?? null,
    progress,
    reason,
    remainingMinutes: tasks.reduce((total, item) => total + item.focusMinutes, 0),
  };
}
