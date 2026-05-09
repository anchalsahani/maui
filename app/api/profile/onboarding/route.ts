import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/session";
import { findUserById, toPublicUser, updateUser } from "@/lib/auth/store";
import type { OnboardingInput } from "@/lib/auth/types";
import { validateOnboardingInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: OnboardingInput;

  try {
    body = (await request.json()) as OnboardingInput;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validated = validateOnboardingInput(body);

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const storedUser = await findUserById(authUser.id);

  if (!storedUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const updatedUser = await updateUser({
    ...storedUser,
    onboardingCompleted: true,
    survey: validated.value,
  });

  return NextResponse.json({ user: toPublicUser(updatedUser) });
}
