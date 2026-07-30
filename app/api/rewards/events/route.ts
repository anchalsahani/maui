import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  createRewardEvent,
  getRewardSummary,
  isRewardEventType,
  listRewardEvents,
} from "@/lib/rewards/store";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const events = await listRewardEvents(user.id);

  return NextResponse.json({
    events,
    summary: getRewardSummary(events),
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = getRewardEventPayload(body);

  if (!payload) {
    return NextResponse.json({ error: "Invalid reward event." }, { status: 400 });
  }

  const event = await createRewardEvent({
    userId: user.id,
    ...payload,
  });
  const events = await listRewardEvents(user.id);

  return NextResponse.json(
    {
      event,
      summary: getRewardSummary(events),
    },
    { status: 201 }
  );
}

function getRewardEventPayload(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as {
    type?: unknown;
    points?: unknown;
    title?: unknown;
  };

  if (
    !isRewardEventType(candidate.type) ||
    typeof candidate.title !== "string" ||
    !candidate.title.trim()
  ) {
    return null;
  }

  return {
    type: candidate.type,
    points: getRewardPoints(candidate.type),
    title: candidate.title.trim().slice(0, 160),
  };
}

function getRewardPoints(
  type: "focus_session" | "micro_step" | "broken_down_task"
) {
  switch (type) {
    case "focus_session":
      return 8;
    case "broken_down_task":
      return 4;
    default:
      return 1;
  }
}
