import { GoogleOAuthError } from "./google";

type OAuthStep =
  | "configuration"
  | "callback_validation"
  | "token_exchange"
  | "profile_fetch"
  | "profile_validation"
  | "user_persistence"
  | "session_creation";

function sanitizeRequestUrl(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.has("code")) {
    url.searchParams.set("code", "[redacted]");
  }
  return url.toString();
}

export function logGoogleOAuthFailure({
  step,
  request,
  error,
  details = {},
}: {
  step: OAuthStep;
  request: Request;
  error?: unknown;
  details?: Record<string, unknown>;
}) {
  const googleError = error instanceof GoogleOAuthError ? error : undefined;
  console.error("Google OAuth failure", {
    step,
    requestUrl: sanitizeRequestUrl(request),
    message: error instanceof Error ? error.message : undefined,
    googleResponseStatus: googleError?.details.status,
    googleResponseBody: googleError?.details.responseBody,
    configured: {
      hasAppUrl: Boolean(process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL),
      hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
      hasClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      isProduction: process.env.NODE_ENV === "production",
    },
    ...details,
  });
}
