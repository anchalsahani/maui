import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { createPasswordHash } from "@/lib/auth/crypto";
import { setSessionCookie } from "@/lib/auth/session";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/auth/store";
import type { SignupInput } from "@/lib/auth/types";
import { validateSignupInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: SignupInput;

  try {
    body = (await request.json()) as SignupInput;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validated = validateSignupInput(body);

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const existingUser = await findUserByEmail(validated.value.email);

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const { passwordHash, passwordSalt } = createPasswordHash(validated.value.password);

  const user = await createUser({
    id: randomUUID(),
    name: validated.value.name,
    email: validated.value.email,
    createdAt: new Date().toISOString(),
    onboardingCompleted: false,
    survey: null,
    passwordHash,
    passwordSalt,
    authProvider: "local",
  });

  const publicUser = toPublicUser(user);
  const response = NextResponse.json({ user: publicUser }, { status: 201 });
  setSessionCookie(response, publicUser);

  return response;
}
