import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  exchangeGoogleCodeForTokens,
  fetchGoogleUser,
  getAppBaseUrl,
  getGoogleOAuthConfig,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/auth/google";
import { setSessionCookie } from "@/lib/auth/session";
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  toPublicUser,
  updateUser,
} from "@/lib/auth/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const oauthError = requestUrl.searchParams.get("error");
  const baseUrl = getAppBaseUrl(request);
  getGoogleOAuthConfig(baseUrl);
  const dashboardUrl = new URL("/dashboard", baseUrl);
  const onboardingUrl = new URL("/onboarding", baseUrl);
  const signupUrl = new URL("/signup", baseUrl);

  const cookieHeader = request.headers.get("cookie") ?? "";
  const stateCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${GOOGLE_OAUTH_STATE_COOKIE}=`))
    ?.split("=")[1];

  if (oauthError || !code || !state || !stateCookie || state !== stateCookie) {
    signupUrl.searchParams.set("authError", "google_failed");
    const response = NextResponse.redirect(signupUrl);
    response.cookies.set({
      name: GOOGLE_OAUTH_STATE_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });
    return response;
  }

  try {
    const tokenResult = await exchangeGoogleCodeForTokens(code, baseUrl);
    const googleUser = await fetchGoogleUser(tokenResult.access_token);

    let user =
      (await findUserByGoogleId(googleUser.sub)) ??
      (await findUserByEmail(googleUser.email));

    if (!user) {
      user = await createUser({
        id: randomUUID(),
        name:
          googleUser.name ??
          [googleUser.given_name, googleUser.family_name].filter(Boolean).join(" ") ??
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
      user = await updateUser({
        ...user,
        authProvider: "google",
        googleId: googleUser.sub,
      });
    }

    const publicUser = toPublicUser(user);
    const redirectTarget =
      publicUser.onboardingCompleted && publicUser.survey
        ? dashboardUrl
        : onboardingUrl;
    const response = NextResponse.redirect(redirectTarget);

    response.cookies.set({
      name: GOOGLE_OAUTH_STATE_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });
    setSessionCookie(response, publicUser);

    return response;
  } catch {
    signupUrl.searchParams.set("authError", "google_failed");
    const response = NextResponse.redirect(signupUrl);
    response.cookies.set({
      name: GOOGLE_OAUTH_STATE_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });
    return response;
  }
}
