import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  AIProviderUnavailableError,
  createStructuredResponse,
} from "@/lib/ai/provider";
import type {
  PlannerAllocation,
  PlannerRequestInput,
  PlannerResult,
} from "@/lib/ai/types";
import type { TaskItem } from "@/components/app/dashboard/types";

export const runtime = "nodejs";

const planSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "plan",
    "headline",
    "framing",
    "dayAtGlance",
    "priorityOrder",
    "hardRules",
    "emergencyProtocol",
    "realisticOutcome",
    "todayStrategy",
    "avoidedOverload",
  ],
  properties: {
    plan: {
      type: "array",
      minItems: 0,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "taskId",
          "title",
          "focusMinutes",
          "intensity",
          "reason",
          "microSteps",
        ],
        properties: {
          taskId: { type: "string" },
          title: { type: "string", maxLength: 120 },
          focusMinutes: { type: "integer", minimum: 5, maximum: 60 },
          intensity: {
            type: "string",
            enum: ["light", "balanced", "deep"],
          },
          reason: { type: "string", maxLength: 180 },
          microSteps: {
            type: "array",
            minItems: 2,
            maxItems: 5,
            items: { type: "string", maxLength: 110 },
          },
        },
      },
    },
    headline: { type: "string", maxLength: 140 },
    framing: { type: "string", maxLength: 420 },
    dayAtGlance: {
      type: "array",
      minItems: 3,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["timeLabel", "title", "goal", "actions", "adhdNote", "energy"],
        properties: {
          timeLabel: { type: "string", maxLength: 48 },
          title: { type: "string", maxLength: 90 },
          goal: { type: "string", maxLength: 180 },
          actions: {
            type: "array",
            minItems: 2,
            maxItems: 5,
            items: { type: "string", maxLength: 120 },
          },
          adhdNote: { type: "string", maxLength: 180 },
          energy: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
    },
    priorityOrder: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: { type: "string", maxLength: 120 },
    },
    hardRules: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string", maxLength: 140 },
    },
    emergencyProtocol: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string", maxLength: 120 },
    },
    realisticOutcome: {
      type: "array",
      minItems: 3,
      maxItems: 7,
      items: { type: "string", maxLength: 120 },
    },
    todayStrategy: { type: "string", maxLength: 260 },
    avoidedOverload: { type: "string", maxLength: 220 },
  },
};

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as PlannerRequestInput;
  const tasks = getPlanningTasks(body, user.studyProfile?.generatedTasks ?? []);
  const fallback = buildFallbackPlan(tasks, body);

  if (tasks.length === 0) {
    return NextResponse.json({
      plan: fallback,
      aiAvailable: false,
      warning: "No tasks are available to allocate yet.",
    });
  }

  try {
    const plan = await createStructuredResponse<PlannerResult>({
      name: "planner_allocation",
      schema: planSchema,
      instructions:
        "You are Maui, an ADHD-aware personal mentor for people with executive dysfunction. Your job is not only task scheduling: observe the user's work pattern, emotional condition, deadlines, routines, avoidance loops, and energy level, then create a healthy day plan. Use fixed commitments as immovable anchors. Place study, chores, errands, meals, games, social time, and rest around those anchors. Treat planning notes as behavioral rules. Detect likely burnout from signs such as overwhelm, low energy, quitting midway, too many unfinished tasks, pressure-heavy deadlines, or emotional rant context. If burnout risk is high, reduce scope and protect recovery. If energy is steady, keep momentum without overloading. Prevent gaming/phone spirals when mentioned, but do not shame the user. Break assignments into tiny starts, name clear stopping points, and choose a next action that can be started in under two minutes. Prefer gentle guidance, plain language, fewer choices, dopamine-friendly wins, and compassionate accountability. Do not tell the user to finish an entire syllabus in one day. Return only schema-valid JSON.",
      maxOutputTokens: 2600,
      input: {
        availableMinutes: clampNumber(body.availableMinutes, 15, 240, 60),
        emotionState: body.emotionState ?? "steady",
        burnoutRisk: body.burnoutRisk ?? "low",
        rantContext: typeof body.rantContext === "string" ? body.rantContext.slice(0, 600) : "",
        todayNotes: typeof body.todayNotes === "string" ? body.todayNotes.slice(0, 5000) : "",
        mentorGoals: [
          "reduce overwhelm",
          "make the first action obvious",
          "protect energy and sleep",
          "adapt to emotional state",
          "balance study with commitments, chores, rest, and recovery",
          "reward progress without pressure",
        ],
        survey: user.survey ?? body.survey ?? null,
        studyProfile: user.studyProfile
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
        tasks: tasks.slice(0, 20),
      },
    });

    return NextResponse.json({ plan, aiAvailable: true });
  } catch (error) {
    if (!(error instanceof AIProviderUnavailableError)) {
      console.error("Planner allocation failed", error);
    }

    return NextResponse.json({
      plan: fallback,
      aiAvailable: false,
      warning: getPlannerWarning(error),
    });
  }
}

function getPlannerWarning(error: unknown) {
  if (error instanceof AIProviderUnavailableError) {
    return `${error.message} Returned local fallback plan.`;
  }

  const message = error instanceof Error ? error.message : String(error);

  if (/api key not valid|API_KEY_INVALID|invalid api key/i.test(message)) {
    return "Gemini API key is invalid. Check GEMINI_API_KEY in .env.local. Returned local fallback plan.";
  }

  if (/quota|RESOURCE_EXHAUSTED|rate limit/i.test(message)) {
    return "Gemini/OpenAI quota or rate limit was reached. Returned local fallback plan.";
  }

  if (/insufficient_quota|exceeded your current quota/i.test(message)) {
    return "OpenAI quota is exhausted for this API key. Add billing/credits or use another OPENAI_API_KEY. Returned local fallback plan.";
  }

  if (/model_not_found|does not exist|do not have access/i.test(message)) {
    return "The configured AI model is unavailable for this API key. Check OPENAI_MODEL or GEMINI_MODEL in .env.local. Returned local fallback plan.";
  }

  return "AI planning failed. Returned local fallback plan.";
}

function getPlanningTasks(
  body: PlannerRequestInput,
  generatedTasks: Array<{
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
  if (Array.isArray(body.tasks) && body.tasks.length > 0) {
    return body.tasks.filter((task) => task.status !== "done");
  }

  return generatedTasks
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
      steps: [
        `Open ${task.title}.`,
        "Review the most relevant notes.",
        "Do one visible practice action.",
      ],
    }));
}

function buildFallbackPlan(tasks: TaskItem[], input: PlannerRequestInput): PlannerResult {
  const availableMinutes = clampNumber(input.availableMinutes, 15, 240, 60);
  const risk = input.burnoutRisk ?? "low";
  const blockLimit = risk === "high" ? 15 : risk === "medium" ? 25 : 45;
  const maxTasks = risk === "high" ? 1 : risk === "medium" ? 2 : 3;
  const sortedTasks = [...tasks].sort(
    (a, b) => b.urgency + b.deadlineWeight - b.difficulty - (a.urgency + a.deadlineWeight - a.difficulty)
  );

  let remaining = availableMinutes;
  const plan: PlannerAllocation[] = sortedTasks.slice(0, maxTasks).flatMap((task) => {
    if (remaining < 5) {
      return [];
    }

    const focusMinutes = Math.min(task.focusMinutes, blockLimit, remaining);
    remaining -= focusMinutes;

    return [
      {
        taskId: task.id,
        title: task.title,
        focusMinutes,
        intensity: risk === "high" ? "light" : risk === "medium" ? "balanced" : "deep",
        reason:
          risk === "high"
            ? "Chosen because it can move forward without a heavy planning load."
            : "Chosen from urgency, deadline pressure, and difficulty balance.",
        microSteps: task.steps.slice(0, 4),
      },
    ];
  });

  return {
    plan,
    headline: "Momentum first, perfection later.",
    framing:
      "You do not need a perfect productivity system today. Start with the easiest useful action, protect your energy, and keep transitions small.",
    dayAtGlance: buildFallbackDayBlocks(plan, risk),
    priorityOrder: plan.map((item) => item.title).slice(0, 5),
    hardRules: [
      "No gaming before the highest pressure task has visible progress.",
      "Keep the phone away during focus blocks.",
      "Do not plan the whole day again when you feel stuck.",
      "Done is better than polished.",
    ],
    emergencyProtocol: [
      "Stand up.",
      "Drink water.",
      "Open only the task.",
      "Set a 10-minute timer and work badly.",
    ],
    realisticOutcome: [
      "One urgent task moved forward.",
      "Fixed commitments attended.",
      "Basic chores handled lightly.",
      "Sleep protected better than usual.",
    ],
    todayStrategy:
      risk === "high"
        ? "Protect energy first: one light block, then reassess."
        : "Work from highest value to lowest, with visible stopping points.",
    avoidedOverload:
      risk === "high"
        ? "Kept the plan to one small action instead of a full schedule."
        : "Capped the plan to a few blocks so it stays startable.",
  };
}

function buildFallbackDayBlocks(
  plan: PlannerAllocation[],
  risk: "low" | "medium" | "high"
) {
  const firstTask = plan[0];
  const secondTask = plan[1];

  return [
    {
      timeLabel: "Start now",
      title: "Tiny reset",
      goal: "Create momentum before avoidance grows.",
      actions: ["Refill water", "Clear one visible distraction", "Charge devices"],
      adhdNote: "Do not deep clean. This is only a launch pad.",
      energy: "low" as const,
    },
    {
      timeLabel: "First focus block",
      title: firstTask?.title ?? "Smallest useful task",
      goal: firstTask?.reason ?? "Make one task feel survivable.",
      actions: firstTask?.microSteps.slice(0, 4) ?? ["Open the task", "Do 10 minutes", "Stop or continue"],
      adhdNote: "The win is starting, not doing it perfectly.",
      energy: risk === "high" ? "low" as const : "medium" as const,
    },
    {
      timeLabel: "Next block",
      title: secondTask?.title ?? "Light admin or chores",
      goal: secondTask?.reason ?? "Handle practical work without draining the day.",
      actions: secondTask?.microSteps.slice(0, 4) ?? ["Pick one chore", "Set a timer", "Stop before it becomes a side quest"],
      adhdNote: "Keep this bounded so it does not swallow the main task.",
      energy: "medium" as const,
    },
    {
      timeLabel: "End of day",
      title: "Low-energy close",
      goal: "Reduce tomorrow's friction and protect sleep.",
      actions: ["Prepare tomorrow basics", "Take out trash if pending", "Wind down without starting a game spiral"],
      adhdNote: "No new big tasks here. Make tomorrow easier.",
      energy: "low" as const,
    },
  ];
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}
