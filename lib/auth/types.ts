export interface UserSurvey {
  focusWindow: "short" | "medium" | "flexible";
  taskPace: "tiny" | "balanced" | "deep";
  overwhelmTrigger: "starting" | "planning" | "finishing" | "switching";
  supportStyle: "gentle" | "direct" | "encouraging";
  energyPattern: "steady" | "waves" | "low";
}

export type StudyGoal = "exam" | "course" | "skill" | "revision" | "other";

export interface SyllabusTopic {
  id: string;
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  priority: "low" | "medium" | "high";
  estimatedMinutes: number;
  sourceLine?: number;
}

export interface GeneratedStudyTask {
  id: string;
  title: string;
  topicId: string;
  subject: string;
  category?: "study" | "commitment" | "chore" | "wellbeing";
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  difficulty: "easy" | "medium" | "hard";
  deadline: string | null;
  progress: number;
  recurrence: "none" | "revision_1_3_7" | "weekly";
  estimatedMinutes: number;
}

export interface SyllabusAsset {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  parseStatus: "queued" | "processing" | "completed" | "failed";
  error: string | null;
}

export interface StudyProfile {
  studying: string;
  goal: StudyGoal;
  preferences: string;
  manualSyllabus: string;
  fixedCommitments: string;
  choresAndErrands: string;
  wellbeingAndFun: string;
  planningNotes: string;
  syllabusAsset: SyllabusAsset | null;
  topics: SyllabusTopic[];
  generatedTasks: GeneratedStudyTask[];
  roadmapStatus: "empty" | "queued" | "processing" | "ready" | "failed";
  lastProcessedAt: string | null;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  onboardingCompleted: boolean;
  survey: UserSurvey | null;
  studyProfile: StudyProfile | null;
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

export type OnboardingInput = UserSurvey;
