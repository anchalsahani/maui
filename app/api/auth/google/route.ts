import { NextResponse } from "next/server";

import {
  buildGoogleAuthUrl,
  createGoogleOAuthState,
  getGoogleOAuthConfig,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/auth/google";

export const runtime = "nodejs";

export async function GET() {
  const config = getGoogleOAuthConfig();

  if (!config.configured) {
    return NextResponse.redirect(new URL("/signup?authError=google_unavailable", config.redirectUri));
  }

  const state = createGoogleOAuthState();
  const googleUrl = buildGoogleAuthUrl(state);
  const response = NextResponse.redirect(googleUrl);

  response.cookies.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
