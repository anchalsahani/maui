import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  getDashboardState,
  isPersistedDashboardState,
  saveDashboardState,
} from "@/lib/dashboard/state-store";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const state = await getDashboardState(user.id);

  return NextResponse.json({ state });
}

export async function PUT(request: Request) {
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

  const state = getStateFromBody(body);

  if (!isPersistedDashboardState(state)) {
    return NextResponse.json(
      { error: "Invalid dashboard state." },
      { status: 400 }
    );
  }

  const currentState = await getDashboardState(user.id);
  const incomingRevision = state.planning?.revision ?? 0;
  const currentRevision = currentState?.planning?.revision ?? 0;

  // A debounced client snapshot can arrive after the planner has already
  // created a newer shared state. Never let that older snapshot undo a plan.
  if (currentState && currentRevision > incomingRevision) {
    return NextResponse.json({ state: currentState });
  }

  const savedState = await saveDashboardState(user.id, state);

  return NextResponse.json({ state: savedState });
}

function getStateFromBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  return (body as { state?: unknown }).state ?? null;
}
