import type { LoginInput, OnboardingInput, SignupInput } from "./types";

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

const allowedSurveyValues = {
  focusWindow: ["short", "medium", "flexible"],
  taskPace: ["tiny", "balanced", "deep"],
  overwhelmTrigger: ["starting", "planning", "finishing", "switching"],
  supportStyle: ["gentle", "direct", "encouraging"],
  energyPattern: ["steady", "waves", "low"],
} as const;

export function validateOnboardingInput(input: OnboardingInput) {
  const { focusWindow, taskPace, overwhelmTrigger, supportStyle, energyPattern } =
    input;

  const isValid =
    allowedSurveyValues.focusWindow.includes(
      focusWindow as (typeof allowedSurveyValues.focusWindow)[number]
    ) &&
    allowedSurveyValues.taskPace.includes(
      taskPace as (typeof allowedSurveyValues.taskPace)[number]
    ) &&
    allowedSurveyValues.overwhelmTrigger.includes(
      overwhelmTrigger as (typeof allowedSurveyValues.overwhelmTrigger)[number]
    ) &&
    allowedSurveyValues.supportStyle.includes(
      supportStyle as (typeof allowedSurveyValues.supportStyle)[number]
    ) &&
    allowedSurveyValues.energyPattern.includes(
      energyPattern as (typeof allowedSurveyValues.energyPattern)[number]
    );

  if (!isValid) {
    return {
      ok: false as const,
      error: "Please complete all onboarding questions.",
    };
  }

  return {
    ok: true as const,
    value: {
      focusWindow,
      taskPace,
      overwhelmTrigger,
      supportStyle,
      energyPattern,
    },
  };
}
