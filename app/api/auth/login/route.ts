import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth/crypto";
import { setSessionCookie } from "@/lib/auth/session";
import { findUserByEmail, toPublicUser } from "@/lib/auth/store";
import type { LoginInput } from "@/lib/auth/types";
import { validateLoginInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: LoginInput;

  try {
    body = (await request.json()) as LoginInput;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validated = validateLoginInput(body);

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const user = await findUserByEmail(validated.value.email);

  if (user && user.authProvider === "google" && !user.passwordHash) {
    return NextResponse.json(
      { error: "This account uses Google sign in. Continue with Google instead." },
      { status: 401 }
    );
  }

  if (
    !user ||
    !verifyPassword({
      password: validated.value.password,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
    })
  ) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const publicUser = toPublicUser(user);
  const response = NextResponse.json({ user: publicUser });
  setSessionCookie(response, publicUser);

  return response;
}
