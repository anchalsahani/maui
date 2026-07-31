import type { TaskItem } from "@/components/app/dashboard/types";

export interface TaskIntelligence {
  category: "deep_work" | "admin" | "errand" | "commitment" | "recovery";
  cognitiveLoad: "light" | "moderate" | "heavy";
  emotionalResistance: "low" | "medium" | "high";
  avoidanceRisk: "low" | "medium" | "high";
  mission: string;
  whyItMatters: string;
  firstStep: string;
  smallerVersion: string;
  recoveryVersion: string;
}

/**
 * Turns a user-entered label into planning signals. This is deliberately kept
 * deterministic so the planner still reasons usefully when an AI provider is
 * unavailable; the structured AI pass receives these signals as context.
 */
export function understandTask(
  task: TaskItem,
  skippedCount = 0
): TaskIntelligence {
  const text = `${task.title} ${task.subject ?? ""} ${task.category ?? ""}`.toLowerCase();
  const category = inferCategory(text, task.category);
  const cognitiveLoad = task.difficulty >= 7 || category === "deep_work"
    ? "heavy"
    : task.difficulty <= 3 || category === "errand" || category === "admin"
      ? "light"
      : "moderate";
  const emotionalResistance = skippedCount >= 2 || task.difficulty >= 8
    ? "high"
    : skippedCount === 1 || task.difficulty >= 5
      ? "medium"
      : "low";
  const avoidanceRisk = skippedCount >= 3 || (task.difficulty >= 7 && !task.progress)
    ? "high"
    : skippedCount > 0 || task.difficulty >= 5
      ? "medium"
      : "low";
  const subject = task.subject || task.title.replace(/^(study|complete|finish|work on)\s+/i, "");
  const mission = buildMission(task.title, subject, category);

  return {
    category,
    cognitiveLoad,
    emotionalResistance,
    avoidanceRisk,
    mission,
    whyItMatters: task.deadline
      ? "It carries real time pressure, so a bounded advance now prevents more pressure later."
      : task.priority === "high"
        ? "It supports a high-priority commitment without asking you to finish everything today."
        : "It is the most useful advance that fits the capacity available right now.",
    firstStep: firstStep(task.title, subject, category),
    smallerVersion: smallerVersion(task.title, subject, category),
    recoveryVersion: "Pause without losing the plan: save one sentence about where to restart, then take a 10-minute recovery break.",
  };
}

function inferCategory(text: string, explicit?: string) {
  if (explicit === "commitment" || /meeting|appointment|lecture|class|call/.test(text)) return "commitment" as const;
  if (explicit === "wellbeing" || /rest|walk|meal|sleep|break/.test(text)) return "recovery" as const;
  if (explicit === "chore" || /errand|grocery|laundry|clean|trash|shopping/.test(text)) return "errand" as const;
  if (/email|reply|form|organize|admin/.test(text)) return "admin" as const;
  return "deep_work" as const;
}

function buildMission(title: string, subject: string, category: TaskIntelligence["category"]) {
  if (category === "deep_work") return `Make one clear advance on ${subject}—not the whole task.`;
  if (category === "errand") return `Remove one practical obstacle by completing the smallest useful part of ${title}.`;
  if (category === "admin") return `Close one open loop in ${title} with a good-enough decision.`;
  if (category === "commitment") return `Prepare for ${title} so it does not create last-minute pressure.`;
  return `Protect recovery so the rest of the day remains possible.`;
}

function firstStep(title: string, subject: string, category: TaskIntelligence["category"]) {
  if (category === "deep_work") return `Open the material for ${subject} and read only the first heading.`;
  if (category === "errand") return `Put the one item you need for ${title} where you can see it.`;
  if (category === "admin") return `Open ${title} and write a one-sentence draft or decision.`;
  if (category === "commitment") return `Open the details for ${title} and confirm the one thing you need next.`;
  return "Choose one genuinely restorative action and set a 10-minute boundary around it.";
}

function smallerVersion(title: string, subject: string, category: TaskIntelligence["category"]) {
  if (category === "deep_work") return `Spend five minutes finding the first concept in ${subject}; stopping there still counts.`;
  if (category === "errand") return `Prepare ${title} without leaving yet.`;
  if (category === "admin") return `Write the subject line or first sentence for ${title}.`;
  if (category === "commitment") return `Set one reminder and gather one required item for ${title}.`;
  return "Take a five-minute reset and let Maui reassess before adding work.";
}
