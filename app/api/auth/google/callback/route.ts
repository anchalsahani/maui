import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  GoogleOAuthError,
  exchangeGoogleCodeForTokens,
  fetchGoogleUser,
  getAppBaseUrl,
  getGoogleOAuthStateCookieOptions,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/auth/google";
import { logGoogleOAuthFailure } from "@/lib/auth/oauth-logging";
import { setSessionCookie } from "@/lib/auth/session";
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  toPublicUser,
  updateUser,
} from "@/lib/auth/store";

export const runtime = "nodejs";

function withClearedOAuthState(response: NextResponse) {
  response.cookies.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: "",
    ...getGoogleOAuthStateCookieOptions(),
    maxAge: 0,
  });
  return response;
}

function failureRedirect(baseUrl: string, reason: string) {
  const signupUrl = new URL("/signup", baseUrl);
  signupUrl.searchParams.set("authError", reason);
  return signupUrl;
}

export async function GET(request: NextRequest) {
  let baseUrl: string;
  try {
    baseUrl = getAppBaseUrl(request);
  } catch (error) {
    logGoogleOAuthFailure({ step: "configuration", request, error });
    return withClearedOAuthState(
      NextResponse.redirect(
        new URL("/signup?authError=google_configuration", request.nextUrl.origin)
      )
    );
  }
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");
  const oauthErrorDescription = request.nextUrl.searchParams.get("error_description");
  const stateCookie = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (oauthError || !code || !state || !stateCookie || state !== stateCookie) {
    logGoogleOAuthFailure({
      step: "callback_validation",
      request,
      details: {
        oauthError,
        oauthErrorDescription,
        hasCode: Boolean(code),
        hasState: Boolean(state),
        hasStateCookie: Boolean(stateCookie),
        stateMatchesCookie: Boolean(state && stateCookie && state === stateCookie),
      },
    });
    return withClearedOAuthState(
      NextResponse.redirect(failureRedirect(baseUrl, oauthError ? "google_cancelled" : "google_state_invalid"))
    );
  }

  try {
    const tokenResult = await exchangeGoogleCodeForTokens(code, baseUrl);
    const googleUser = await fetchGoogleUser(tokenResult.access_token);

    if (!googleUser.sub || !googleUser.email || googleUser.email_verified !== true) {
      throw new GoogleOAuthError(
        "profile_validation",
        "Google did not return a verified email address."
      );
    }

    let user;
    try {
      user =
        (await findUserByGoogleId(googleUser.sub)) ??
        (await findUserByEmail(googleUser.email));

      if (!user) {
        user = await createUser({
          id: randomUUID(),
          name:
            googleUser.name ||
            [googleUser.given_name, googleUser.family_name].filter(Boolean).join(" ") ||
            googleUser.email.split("@")[0],
          email: googleUser.email.toLowerCase(),
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
          survey: null,
          studyProfile: null,
          passwordHash: "",
          passwordSalt: "",
          authProvider: "google",
          googleId: googleUser.sub,
        });
      } else if (!user.googleId || user.authProvider !== "google") {
        user = await updateUser({ ...user, authProvider: "google", googleId: googleUser.sub });
      }
    } catch (error) {
      logGoogleOAuthFailure({ step: "user_persistence", request, error });
      return withClearedOAuthState(
        NextResponse.redirect(failureRedirect(baseUrl, "google_account"))
      );
    }

    const redirectTarget =
      user.onboardingCompleted && user.survey
        ? new URL("/dashboard", baseUrl)
        : new URL("/onboarding", baseUrl);
    const response = withClearedOAuthState(NextResponse.redirect(redirectTarget));

    try {
      setSessionCookie(response, toPublicUser(user));
    } catch (error) {
      logGoogleOAuthFailure({ step: "session_creation", request, error });
      return withClearedOAuthState(
        NextResponse.redirect(failureRedirect(baseUrl, "google_session"))
      );
    }

    return response;
  } catch (error) {
    const step = error instanceof GoogleOAuthError ? error.step : "profile_fetch";
    logGoogleOAuthFailure({ step, request, error });
    return withClearedOAuthState(
      NextResponse.redirect(failureRedirect(baseUrl, `google_${step}`))
    );
  }
}
