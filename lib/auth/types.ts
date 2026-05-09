export interface UserSurvey {
  focusWindow: "short" | "medium" | "flexible";
  taskPace: "tiny" | "balanced" | "deep";
  overwhelmTrigger: "starting" | "planning" | "finishing" | "switching";
  supportStyle: "gentle" | "direct" | "encouraging";
  energyPattern: "steady" | "waves" | "low";
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  onboardingCompleted: boolean;
  survey: UserSurvey | null;
}

export interface StoredUser extends AuthUser {
  passwordHash: string;
  passwordSalt: string;
  authProvider?: "local" | "google";
  googleId?: string;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

export interface OnboardingInput extends UserSurvey {}
