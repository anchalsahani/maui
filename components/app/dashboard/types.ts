export type EntryMode = "ready" | "stuck" | "tired" | null;
export type SessionStatus = "idle" | "active" | "paused" | "completed";
export type EmotionState = "steady" | "stressed" | "tired" | "overwhelmed" | "hopeful";

export interface TaskItem {
  id: string;
  title: string;
  topicId?: string;
  subject?: string;
  category?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  urgency: number;
  difficulty: number;
  deadlineWeight: number;
  focusMinutes: number;
  progress?: number;
  deadline?: string | null;
  recurrence?: "none" | "revision_1_3_7" | "weekly";
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
  dashboardRoadmapKey?: string;
  tasks: TaskItem[];
  taskChecklist?: TaskItem[];
  completedTaskIds?: string[];
  reward: RewardState;
  session: SessionState;
  recentMoments: string[];
  completedMicroSteps: string[];
  emotionDraft?: string;
}
