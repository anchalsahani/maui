import { NextResponse } from "next/server";

import {
  buildGoogleAuthUrl,
  createGoogleOAuthState,
  getAppBaseUrl,
  getGoogleOAuthConfig,
  getGoogleOAuthStateCookieOptions,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/auth/google";
import { hasAuthSecret } from "@/lib/auth/crypto";
import { logGoogleOAuthFailure } from "@/lib/auth/oauth-logging";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  let baseUrl: string;

  try {
    baseUrl = getAppBaseUrl(request);
  } catch (error) {
    logGoogleOAuthFailure({ step: "configuration", request, error });
    return NextResponse.redirect(
      new URL("/signup?authError=google_configuration", requestOrigin)
    );
  }

  // The state cookie is host-only. Always set it on the same canonical host
  // that Google will use for the callback.
  if (requestOrigin !== baseUrl) {
    return NextResponse.redirect(new URL("/api/auth/google", baseUrl));
  }

  const config = getGoogleOAuthConfig(baseUrl);

  if (!config.configured || !hasAuthSecret()) {
    return NextResponse.redirect(new URL("/signup?authError=google_configuration", baseUrl));
  }

  const state = createGoogleOAuthState();
  const googleUrl = buildGoogleAuthUrl(state, baseUrl);
  const response = NextResponse.redirect(googleUrl);

  response.cookies.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: state,
    ...getGoogleOAuthStateCookieOptions(),
  });

  return response;
}
