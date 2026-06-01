import { NextResponse } from "next/server";

import type { TaskItem } from "@/components/app/dashboard/types";
import {
  AIProviderUnavailableError,
  createStructuredResponse,
} from "@/lib/ai/provider";
import type { TaskBreakdownResult } from "@/lib/ai/types";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const runtime = "nodejs";

const breakdownSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "contextNote", "microSteps", "stuckReason"],
  properties: {
    title: { type: "string", maxLength: 90 },
    contextNote: { type: "string", maxLength: 180 },
    microSteps: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: { type: "string", maxLength: 120 },
    },
    stuckReason: { type: "string", maxLength: 160 },
  },
};

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const task = getTask(body);

  if (!task) {
    return NextResponse.json({ error: "Task is required." }, { status: 400 });
  }

  const fallback = buildFallbackBreakdown(task);

  try {
    const breakdown = await createStructuredResponse<TaskBreakdownResult>({
      name: "task_breakdown",
      schema: breakdownSchema,
      instructions:
        "You are Maui, an ADHD-aware mentor. The user clicked Feeling stuck, so break the current task into tiny, concrete, non-vague steps that can be done immediately. Use the actual task title, subject, category, planning notes, emotional state, burnout risk, recent moments, and user support preferences. Steps must be visible actions, not abstract advice. Avoid words like review, study, understand, or work on unless paired with a concrete object and action. The first step must take under 30 seconds. Include a gentle context note explaining why this breakdown is lighter. Return only schema-valid JSON.",
      maxOutputTokens: 800,
      input: {
        task,
        emotionState: getString(body, "emotionState") || "steady",
        burnoutRisk: getString(body, "burnoutRisk") || "low",
        recentMoments: getStringArray(body, "recentMoments").slice(0, 5),
        completedMicroSteps: getStringArray(body, "completedMicroSteps").slice(0, 12),
        survey: user.survey,
        studyProfile: user.studyProfile
          ? {
              studying: user.studyProfile.studying,
              preferences: user.studyProfile.preferences,
              fixedCommitments: user.studyProfile.fixedCommitments,
              choresAndErrands: user.studyProfile.choresAndErrands,
              wellbeingAndFun: user.studyProfile.wellbeingAndFun,
              planningNotes: user.studyProfile.planningNotes,
            }
          : null,
      },
    });

    return NextResponse.json({ breakdown, aiAvailable: true });
  } catch (error) {
    if (!(error instanceof AIProviderUnavailableError)) {
      console.error("Task breakdown failed", error);
    }

    return NextResponse.json({
      breakdown: fallback,
      aiAvailable: false,
      warning:
        error instanceof AIProviderUnavailableError
          ? `${error.message} Returned local fallback breakdown.`
          : "AI task breakdown failed. Returned local fallback breakdown.",
    });
  }
}

function getTask(body: unknown): TaskItem | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const value = (body as { task?: unknown }).task;

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TaskItem>;

  if (typeof candidate.id !== "string" || typeof candidate.title !== "string") {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    subject: candidate.subject,
    category: candidate.category,
    status: candidate.status,
    priority: candidate.priority,
    urgency: candidate.urgency ?? 5,
    difficulty: candidate.difficulty ?? 4,
    deadlineWeight: candidate.deadlineWeight ?? 1,
    focusMinutes: candidate.focusMinutes ?? 20,
    progress: candidate.progress,
    deadline: candidate.deadline,
    recurrence: candidate.recurrence,
    steps: candidate.steps ?? [],
  };
}

function getString(body: unknown, key: string) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const value = (body as Record<string, unknown>)[key];

  return typeof value === "string" ? value : "";
}

function getStringArray(body: unknown, key: string) {
  if (!body || typeof body !== "object") {
    return [];
  }

  const value = (body as Record<string, unknown>)[key];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function buildFallbackBreakdown(task: TaskItem): TaskBreakdownResult {
  const title = task.title.replace(/^Study\s+/i, "").trim();

  return {
    title: `Tiny start for ${title}`,
    contextNote:
      "Maui kept this small because stuck mode works best when the first action is obvious.",
    stuckReason: "The task likely feels too broad or has too many invisible steps.",
    microSteps: [
      `Open the place where "${title}" lives.`,
      "Put your cursor, notebook, or hand on the exact starting spot.",
      "Read only the first heading, question, or instruction.",
      "Write one messy sentence about what this task is asking.",
      "Do one 2-minute attempt, then stop and mark progress.",
    ],
  };
}
