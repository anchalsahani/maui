import type {
  EmotionState,
  TaskItem,
} from "@/components/app/dashboard/types";
import type {
  BurnoutRisk,
  PlannerAllocation,
} from "@/lib/ai/types";

export interface CapacityContext {
  emotionState: EmotionState;
  burnoutRisk: BurnoutRisk;
}

export function getAdaptiveTaskScore(
  task: TaskItem,
  context: CapacityContext
) {
  const urgencyScore = task.urgency * 1.6;
  const deadlineScore = task.deadlineWeight * 2;
  const difficultyCost =
    task.difficulty *
    (context.burnoutRisk === "high"
      ? 1.8
      : context.burnoutRisk === "medium"
        ? 1.3
        : 1);
  const energyFit =
    context.emotionState === "tired" || context.emotionState === "overwhelmed"
      ? Math.max(0, 8 - task.difficulty) * 0.9
      : 0;
  const essentialBoost =
    task.priority === "high" || task.category === "commitment" ? 4 : 0;
  const wellbeingBoost =
    context.burnoutRisk === "high" && task.category === "wellbeing" ? 5 : 0;

  return (
    urgencyScore +
    deadlineScore +
    energyFit +
    essentialBoost +
    wellbeingBoost -
    difficultyCost
  );
}

export function adaptTasksToCapacity(
  tasks: TaskItem[],
  context: CapacityContext
) {
  const focusCap =
    context.burnoutRisk === "high" || context.emotionState === "overwhelmed"
      ? 10
      : context.burnoutRisk === "medium" || context.emotionState === "tired"
        ? 15
        : 45;

  return tasks
    .map((task) => ({
      ...task,
      focusMinutes: Math.max(5, Math.min(task.focusMinutes, focusCap)),
    }))
    .sort(
      (a, b) =>
        getAdaptiveTaskScore(b, context) - getAdaptiveTaskScore(a, context)
    );
}

export function applyPlannerAllocations(
  tasks: TaskItem[],
  allocations: PlannerAllocation[]
) {
  const allocationById = new Map(
    allocations.map((allocation) => [allocation.taskId, allocation])
  );
  const orderById = new Map(
    allocations.map((allocation, index) => [allocation.taskId, index])
  );

  return tasks
    .map((task) => {
      const allocation = allocationById.get(task.id);

      if (!allocation) {
        return task;
      }

      return {
        ...task,
        focusMinutes: Math.max(5, Math.min(60, allocation.focusMinutes)),
      };
    })
    .sort((a, b) => {
      const aOrder = orderById.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = orderById.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
}
