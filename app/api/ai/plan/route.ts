import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  AIProviderUnavailableError,
  createStructuredResponse,
} from "@/lib/ai/provider";
import { getDashboardState } from "@/lib/dashboard/state-store";
import { getRewardSummary, listRewardEvents } from "@/lib/rewards/store";
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
    "situation",
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
    situation: {
      type: "object",
      additionalProperties: false,
      required: [
        "detectedObligations",
        "constraints",
        "emotionalState",
        "emotionReason",
        "timePressure",
        "strategyType",
        "parallelOptions",
        "enoughForToday",
      ],
      properties: {
        detectedObligations: {
          type: "array",
          minItems: 1,
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "label", "category", "urgency", "whyItMatters"],
            properties: {
              id: { type: "string", maxLength: 40 },
              label: { type: "string", maxLength: 90 },
              category: {
                type: "string",
                enum: ["study", "chore", "commitment", "wellbeing", "admin"],
              },
              urgency: { type: "string", enum: ["low", "medium", "high"] },
              whyItMatters: { type: "string", maxLength: 160 },
            },
          },
        },
        constraints: {
          type: "array",
          minItems: 1,
          maxItems: 6,
          items: { type: "string", maxLength: 130 },
        },
        emotionalState: {
          type: "string",
          enum: ["steady", "stressed", "tired", "overwhelmed", "hopeful"],
        },
        emotionReason: { type: "string", maxLength: 220 },
        timePressure: { type: "string", enum: ["low", "medium", "high"] },
        strategyType: {
          type: "string",
          enum: [
            "parallel_options",
            "alternating_loops",
            "deadline_triage",
            "burnout_protection",
            "interruption_reentry",
          ],
        },
        parallelOptions: {
          type: "array",
          minItems: 2,
          maxItems: 5,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "bestWhen", "firstAction", "reentryAction"],
            properties: {
              label: { type: "string", maxLength: 80 },
              bestWhen: { type: "string", maxLength: 130 },
              firstAction: { type: "string", maxLength: 130 },
              reentryAction: { type: "string", maxLength: 130 },
            },
          },
        },
        enoughForToday: { type: "string", maxLength: 200 },
      },
    },
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
  const dashboardState = await getDashboardState(user.id);
  const rewardEvents = await listRewardEvents(user.id);
  const historicalSignals = {
    recentMoments: dashboardState?.recentMoments?.slice(0, 8) ?? [],
    activeSession: dashboardState?.session?.status ?? "idle",
    pendingTasks: dashboardState?.tasks?.length ?? 0,
    completedTaskIds: dashboardState?.completedTaskIds?.slice(0, 12) ?? [],
    rewardSummary: getRewardSummary(rewardEvents),
    recentRewardEvents: rewardEvents.slice(0, 8).map((event) => ({
      type: event.type,
      title: event.title,
      createdAt: event.createdAt,
    })),
  };
  const fallback = buildFallbackPlan(tasks, body, historicalSignals);

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
        "You are Maui, an ADHD-aware mental-health support planner for executive dysfunction. Follow this exact reasoning: Input -> Detect tasks, constraints, emotion, time pressure -> choose strategy type -> output. First identify ALL active obligations as parallel options, never as a single forced path. Include studying, chores, kitchen work, fixed commitments, rest, admin, and emotional regulation when present. Analyze emotion from current input and historical signals. Correct misclassifications: phrases like 'idk what to do', 'can't choose', 'everything feels too much', 'stuck', or blank/shutdown language mean confusion/overwhelm, not calm. Adapt to time pressure such as an exam tomorrow, deadline today, low sleep, interruptions, and low energy. When responsibilities compete, create flexible loops or alternating blocks such as study + kitchen cycles, not rigid sequential steps. Reduce decision paralysis: validate the conflict, show the smallest meaningful first action, and name re-entry after interruption. Prioritize momentum over completion. Define realistic enough-for-today based on urgency. Avoid generic productivity advice, shame, and long reading. Do not duplicate dashboard-style full task lists. Return only schema-valid JSON.",
      maxOutputTokens: 2600,
      input: {
        availableMinutes: clampNumber(body.availableMinutes, 15, 240, 60),
        detectedEmotionHint: detectEmotionFromText(
          [
            body.emotionState,
            body.rantContext,
            body.todayNotes,
            ...historicalSignals.recentMoments,
          ].join("\n")
        ),
        emotionState: body.emotionState ?? "steady",
        burnoutRisk: body.burnoutRisk ?? "low",
        rantContext: typeof body.rantContext === "string" ? body.rantContext.slice(0, 600) : "",
        todayNotes: typeof body.todayNotes === "string" ? body.todayNotes.slice(0, 5000) : "",
        historicalSignals,
        mentorGoals: [
          "reduce overwhelm",
          "make the first action obvious",
          "surface all active obligations as parallel choices",
          "correct calm/neutral misclassification when confusion or stuckness is present",
          "use loops or alternating blocks when responsibilities compete",
          "define realistic enough-for-today",
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

function buildFallbackPlan(
  tasks: TaskItem[],
  input: PlannerRequestInput,
  historicalSignals: {
    recentMoments: string[];
    activeSession: string;
    pendingTasks: number;
    completedTaskIds: string[];
    rewardSummary: {
      totalPoints: number;
      sessionsCompleted: number;
      microTasksCompleted: number;
      streak: number;
    };
    recentRewardEvents: Array<{
      type: string;
      title: string;
      createdAt: string;
    }>;
  }
): PlannerResult {
  const availableMinutes = clampNumber(input.availableMinutes, 15, 240, 60);
  const detectedEmotion = detectEmotionFromText(
    [
      input.emotionState,
      input.rantContext,
      input.todayNotes,
      ...historicalSignals.recentMoments,
    ].join("\n")
  );
  const risk =
    detectedEmotion === "overwhelmed"
      ? "high"
      : detectedEmotion === "tired" || detectedEmotion === "stressed"
        ? "medium"
        : input.burnoutRisk ?? "low";
  const obligations = detectObligations(tasks, input.todayNotes ?? "");
  const hasCompetingResponsibilities = obligations.length > 1;
  const hasHighTimePressure = hasUrgentLanguage(input.todayNotes ?? "") || tasks.some(isHighPressureTask);
  const strategyType = risk === "high"
    ? "burnout_protection"
    : hasHighTimePressure
      ? "deadline_triage"
      : hasCompetingResponsibilities
        ? "alternating_loops"
        : "parallel_options";
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
    situation: {
      detectedObligations: obligations,
      constraints: detectConstraints(input, historicalSignals, hasHighTimePressure),
      emotionalState: detectedEmotion,
      emotionReason: getEmotionReason(detectedEmotion),
      timePressure: hasHighTimePressure ? "high" : availableMinutes < 30 ? "medium" : "low",
      strategyType,
      parallelOptions: buildParallelOptions(obligations, strategyType),
      enoughForToday: buildEnoughForToday({
        hasHighTimePressure,
        risk,
        firstTaskTitle: plan[0]?.title,
      }),
    },
    plan,
    headline:
      strategyType === "alternating_loops"
        ? "Two tracks, one tiny loop at a time."
        : strategyType === "deadline_triage"
          ? "Handle the pressure without trying to do everything."
          : "Momentum first, perfection later.",
    framing:
      hasCompetingResponsibilities
        ? "You are not failing because there are multiple real demands. Treat them as parallel options and use short loops so one responsibility does not erase the other."
        : "You do not need a perfect productivity system today. Start with the easiest useful action, protect your energy, and keep transitions small.",
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

function detectEmotionFromText(text: string): "steady" | "stressed" | "tired" | "overwhelmed" | "hopeful" {
  const normalized = text.toLowerCase();

  if (
    /\b(idk|i don't know|dont know|can't choose|cant choose|what to do|confused|stuck|freeze|frozen|too much|overwhelmed|spiral|panic)\b/.test(
      normalized
    )
  ) {
    return "overwhelmed";
  }

  if (/\b(exam tomorrow|deadline|urgent|late|behind|stress|stressed|pressure)\b/.test(normalized)) {
    return "stressed";
  }

  if (/\b(tired|drained|sleepy|exhausted|burnt|burned|low energy)\b/.test(normalized)) {
    return "tired";
  }

  if (/\b(hopeful|ready|clear|okay|can start|motivated)\b/.test(normalized)) {
    return "hopeful";
  }

  return "steady";
}

function detectObligations(tasks: TaskItem[], notes: string) {
  const taskObligations = tasks.slice(0, 5).map((task, index) => ({
    id: task.id || `task-${index}`,
    label: task.title,
    category: getObligationCategory(`${task.category ?? ""} ${task.subject ?? ""} ${task.title}`),
    urgency: task.priority === "high" || task.urgency >= 8 ? "high" as const : task.urgency >= 6 ? "medium" as const : "low" as const,
    whyItMatters: task.deadline
      ? `Deadline pressure around ${task.deadline}.`
      : "It is already in your active task pool.",
  }));

  const noteObligations = [
    {
      pattern: /\b(kitchen|cook|dishes|clean|laundry|chores?)\b/i,
      label: "Home or kitchen work",
      category: "chore" as const,
    },
    {
      pattern: /\b(exam|test|study|revision|syllabus|assignment)\b/i,
      label: "Study or exam work",
      category: "study" as const,
    },
    {
      pattern: /\b(appointment|class|meeting|call|commute)\b/i,
      label: "Fixed commitment",
      category: "commitment" as const,
    },
    {
      pattern: /\b(rest|sleep|food|eat|meal|break|shower)\b/i,
      label: "Body care",
      category: "wellbeing" as const,
    },
  ]
    .filter((item) => item.pattern.test(notes))
    .map((item, index) => ({
      id: `context-${index}`,
      label: item.label,
      category: item.category,
      urgency: hasUrgentLanguage(notes) ? "high" as const : "medium" as const,
      whyItMatters: "Mentioned in the current context, so it competes for attention now.",
    }));

  const merged = [...noteObligations, ...taskObligations].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.label.toLowerCase() === item.label.toLowerCase()) === index
  );

  return merged.length > 0
    ? merged.slice(0, 6)
    : [
        {
          id: "emotional-regulation",
          label: "Reduce decision pressure",
          category: "wellbeing" as const,
          urgency: "medium" as const,
          whyItMatters: "The first obligation is making the next step clear enough to start.",
        },
      ];
}

function getObligationCategory(text: string) {
  if (/\b(chore|kitchen|cook|dishes|clean|laundry|errand|household)\b/i.test(text)) {
    return "chore" as const;
  }

  if (/\b(class|meeting|appointment|call|commute|commitment)\b/i.test(text)) {
    return "commitment" as const;
  }

  if (/\b(rest|sleep|meal|break|walk|wellbeing|game|social)\b/i.test(text)) {
    return "wellbeing" as const;
  }

  if (/\b(admin|email|form|reply|bill)\b/i.test(text)) {
    return "admin" as const;
  }

  return "study" as const;
}

function hasUrgentLanguage(text: string) {
  return /\b(exam tomorrow|tomorrow|today|tonight|deadline|urgent|due|late|behind)\b/i.test(text);
}

function isHighPressureTask(task: TaskItem) {
  return task.priority === "high" || task.deadlineWeight >= 3 || task.urgency >= 8;
}

function detectConstraints(
  input: PlannerRequestInput,
  historicalSignals: {
    recentMoments: string[];
    activeSession: string;
    pendingTasks: number;
    completedTaskIds: string[];
    rewardSummary: { streak: number };
  },
  hasHighTimePressure: boolean
) {
  const constraints = [
    hasHighTimePressure ? "Time pressure is high, so scope must be smaller than the full ideal plan." : "",
    input.availableMinutes ? `${clampNumber(input.availableMinutes, 15, 240, 60)} minutes available right now.` : "",
    historicalSignals.pendingTasks > 4 ? "There are several active tasks, which can create choice paralysis." : "",
    historicalSignals.recentMoments.some((moment) => /stopped midway|paused|stuck|overwhelmed/i.test(moment))
      ? "Recent dashboard activity suggests interruption or stuckness risk."
      : "",
    historicalSignals.rewardSummary.streak === 0 ? "Momentum may need a very small first win." : "",
  ].filter(Boolean);

  return constraints.length > 0 ? constraints.slice(0, 6) : ["Keep the plan short enough to re-enter after interruption."];
}

function getEmotionReason(emotion: "steady" | "stressed" | "tired" | "overwhelmed" | "hopeful") {
  switch (emotion) {
    case "overwhelmed":
      return "The language or history points to confusion, stuckness, or too many competing options.";
    case "stressed":
      return "Deadline or pressure language is present, so urgency should be acknowledged directly.";
    case "tired":
      return "Energy appears limited, so the plan should use shorter blocks and easier re-entry.";
    case "hopeful":
      return "There are signs of readiness, but the plan should still avoid overloading momentum.";
    default:
      return "No strong distress signal was detected, so the plan can stay gentle and practical.";
  }
}

function buildParallelOptions(
  obligations: ReturnType<typeof detectObligations>,
  strategyType: "parallel_options" | "alternating_loops" | "deadline_triage" | "burnout_protection" | "interruption_reentry"
) {
  if (strategyType === "alternating_loops" && obligations.length >= 2) {
    return [
      {
        label: `${obligations[0].label} loop`,
        bestWhen: "You can focus for one small block before switching.",
        firstAction: "Set a 10-minute timer and open only the first item.",
        reentryAction: "Return by reading the last visible line or checklist item.",
      },
      {
        label: `${obligations[1].label} loop`,
        bestWhen: "The other responsibility is pulling attention hard.",
        firstAction: "Do one bounded physical or practical action.",
        reentryAction: "Stop at the timer and name the next tiny step.",
      },
    ];
  }

  return obligations.slice(0, 4).map((obligation) => ({
    label: obligation.label,
    bestWhen: obligation.urgency === "high" ? "This is the loudest pressure." : "This feels most startable.",
    firstAction:
      obligation.category === "chore"
        ? "Do the smallest visible piece for five minutes."
        : "Open the material and touch only the first tiny step.",
    reentryAction: "Come back by repeating the same first action, not by replanning.",
  }));
}

function buildEnoughForToday({
  hasHighTimePressure,
  risk,
  firstTaskTitle,
}: {
  hasHighTimePressure: boolean;
  risk: "low" | "medium" | "high";
  firstTaskTitle: string | undefined;
}) {
  if (risk === "high") {
    return `Enough is one visible move${firstTaskTitle ? ` on ${firstTaskTitle}` : ""}, plus basic body care.`;
  }

  if (hasHighTimePressure) {
    return `Enough is progress on the highest-pressure item${firstTaskTitle ? ` (${firstTaskTitle})` : ""}, not a perfect full-day reset.`;
  }

  return "Enough is two short starts and a clear re-entry point for tomorrow.";
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}
