export type EntryMode = "ready" | "stuck" | "tired" | null;
export type SessionStatus = "idle" | "active" | "paused" | "completed";
export type EmotionState = "steady" | "stressed" | "tired" | "overwhelmed" | "hopeful";

export interface TaskItem {
  id: string;
  title: string;
  urgency: number;
  difficulty: number;
  deadlineWeight: number;
  focusMinutes: number;
  steps: string[];
}

export interface RewardState {
  points: number;
  streak: number;
  sessionsCompleted: number;
  microTasksCompleted: number;
}

export interface SessionState {
  status: SessionStatus;
  title: string;
  mode: "pomodoro" | "micro";
  focusMinutes: number;
  runId: number;
}

export interface PersistedDashboardState {
  tasks: TaskItem[];
  reward: RewardState;
  session: SessionState;
  recentMoments: string[];
  completedMicroSteps: string[];
}
