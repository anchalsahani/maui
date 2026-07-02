import { randomBytes } from "node:crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const GOOGLE_OAUTH_STATE_COOKIE = "maui_google_oauth_state";

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalhostUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

export function getAppBaseUrl(request?: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  const requestOrigin = request ? new URL(request.url).origin : "";

  if (
    configuredUrl &&
    !(requestOrigin && isLocalhostUrl(configuredUrl) && !isLocalhostUrl(requestOrigin))
  ) {
    return normalizeBaseUrl(configuredUrl);
  }

  return normalizeBaseUrl(requestOrigin || "http://localhost:3000");
}

export function getGoogleOAuthConfig(baseUrl = getAppBaseUrl()) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret),
  };
}

export function createGoogleOAuthState() {
  return randomBytes(24).toString("hex");
}

export function buildGoogleAuthUrl(state: string, baseUrl?: string) {
  const { clientId, redirectUri } = getGoogleOAuthConfig(baseUrl);

  if (!clientId) {
    throw new Error("Google OAuth is not configured.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    include_granted_scopes: "true",
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCodeForTokens(code: string, baseUrl?: string) {
  const { clientId, clientSecret, redirectUri, configured } =
    getGoogleOAuthConfig(baseUrl);

  if (!configured || !clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Google authorization code.");
  }

  return (await response.json()) as {
    access_token: string;
    id_token?: string;
  };
}

export async function fetchGoogleUser(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google user profile.");
  }

  return (await response.json()) as {
    sub: string;
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
  };
}
