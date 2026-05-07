import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

import type { SessionPayload } from "./types";

const AUTH_SECRET =
  process.env.AUTH_SECRET ?? "maui-dev-secret-change-me-before-production";
const HASH_ITERATIONS = 120_000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = "sha512";

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createPasswordHash(password: string) {
  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = pbkdf2Sync(
    password,
    passwordSalt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    HASH_DIGEST
  ).toString("hex");

  return { passwordHash, passwordSalt };
}

export function verifyPassword({
  password,
  passwordHash,
  passwordSalt,
}: {
  password: string;
  passwordHash: string;
  passwordSalt: string;
}) {
  const derived = pbkdf2Sync(
    password,
    passwordSalt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    HASH_DIGEST
  );
  const expected = Buffer.from(passwordHash, "hex");

  return (
    derived.length === expected.length && timingSafeEqual(derived, expected)
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
}

export function createSessionToken(payload: SessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload)
    ) as SessionPayload;

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

