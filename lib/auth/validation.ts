import type { LoginInput, SignupInput } from "./types";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateSignupInput(input: SignupInput) {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!firstName || !lastName) {
    return { ok: false as const, error: "First and last name are required." };
  }

  if (!isValidEmail(email)) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return {
      ok: false as const,
      error: "Password must be at least 8 characters long.",
    };
  }

  return {
    ok: true as const,
    value: {
      firstName,
      lastName,
      email,
      password,
      name: `${firstName} ${lastName}`.trim(),
    },
  };
}

export function validateLoginInput(input: LoginInput) {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!isValidEmail(email)) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  if (!password) {
    return { ok: false as const, error: "Password is required." };
  }

  return {
    ok: true as const,
    value: {
      email,
      password,
    },
  };
}

