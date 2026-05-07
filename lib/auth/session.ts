import type { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSessionToken, verifySessionToken } from "./crypto";
import { findUserById, toPublicUser } from "./store";
import type { AuthUser } from "./types";

export const AUTH_COOKIE_NAME = "maui_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function setSessionCookie(
  response: NextResponse,
  user: Pick<AuthUser, "id" | "email" | "name">
) {
  const token = createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const user = await findUserById(payload.sub);
  return user ? toPublicUser(user) : null;
}

