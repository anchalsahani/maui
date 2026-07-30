import { NextResponse } from "next/server";

import type { EmotionState } from "@/components/app/dashboard/types";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  recordPlanningEvent,
  type PlanningEventInput,
} from "@/lib/planning/synchronization";

export const runtime = "nodejs";

const eventTypes = new Set<PlanningEventInput["type"]>([
  "focus_started",
  "task_completed",
  "focus_completed",
  "task_skipped",
  "context_changed",
]);
const emotionStates = new Set<EmotionState>([
  "steady",
  "stressed",
  "tired",
  "overwhelmed",
  "hopeful",
]);

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const event = parseEvent(body);

  if (!event) {
    return NextResponse.json({ error: "Invalid planning event." }, { status: 400 });
  }

  const state = await recordPlanningEvent(user.id, event);

  if (!state) {
    return NextResponse.json(
      { error: "Create or open your workspace before recording planning events." },
      { status: 409 }
    );
  }

  return NextResponse.json({ state, revision: state.planning?.revision ?? 0 });
}

function parseEvent(value: unknown): PlanningEventInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.type !== "string" || !eventTypes.has(candidate.type as PlanningEventInput["type"])) {
    return null;
  }

  const emotionState =
    typeof candidate.emotionState === "string" &&
    emotionStates.has(candidate.emotionState as EmotionState)
      ? (candidate.emotionState as EmotionState)
      : undefined;
  const burnoutRisk =
    candidate.burnoutRisk === "low" ||
    candidate.burnoutRisk === "medium" ||
    candidate.burnoutRisk === "high"
      ? candidate.burnoutRisk
      : undefined;
  const energyLevel =
    candidate.energyLevel === "low" ||
    candidate.energyLevel === "medium" ||
    candidate.energyLevel === "high"
      ? candidate.energyLevel
      : undefined;

  return {
    type: candidate.type as PlanningEventInput["type"],
    taskId:
      typeof candidate.taskId === "string" ? candidate.taskId.slice(0, 120) : undefined,
    title: typeof candidate.title === "string" ? candidate.title.slice(0, 180) : undefined,
    durationMinutes:
      typeof candidate.durationMinutes === "number"
        ? candidate.durationMinutes
        : undefined,
    rewardPoints:
      typeof candidate.rewardPoints === "number" ? candidate.rewardPoints : undefined,
    incrementStreak:
      typeof candidate.incrementStreak === "boolean"
        ? candidate.incrementStreak
        : undefined,
    incrementSessions:
      typeof candidate.incrementSessions === "boolean"
        ? candidate.incrementSessions
        : undefined,
    blockId: typeof candidate.blockId === "string" ? candidate.blockId.slice(0, 120) : undefined,
    runId: typeof candidate.runId === "number" ? candidate.runId : undefined,
    startedAt: typeof candidate.startedAt === "string" ? candidate.startedAt : undefined,
    endsAt: typeof candidate.endsAt === "string" ? candidate.endsAt : undefined,
    emotionState,
    burnoutRisk,
    energyLevel,
    summary:
      typeof candidate.summary === "string" ? candidate.summary.slice(0, 360) : undefined,
  };
}
