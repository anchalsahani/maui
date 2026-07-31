import type { PlannerResult } from "@/lib/ai/types";

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
  longestStreak?: number;
  activityDays?: string[];
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

export type PlanningBlockStatus =
  | "upcoming"
  | "ready"
  | "in_progress"
  | "paused"
  | "completed"
  | "skipped"
  | "rescheduled"
  | "adapted"
  // Retained to read existing persisted plans.
  | "planned";

export interface ActivePlanningSession {
  blockId: string;
  taskId: string;
  title: string;
  focusMinutes: number;
  status: "active" | "paused";
  startedAt: string;
  endsAt: string;
  runId: number;
  elapsedSeconds?: number;
  remainingSeconds?: number;
  pausedAt?: string | null;
}

export interface PlanningMemoryEntry {
  id: string;
  type:
    | "plan_created"
    | "focus_started"
    | "task_completed"
    | "focus_completed"
    | "task_skipped"
    | "context_changed";
  summary: string;
  createdAt: string;
  taskId?: string;
}

export interface PlanningSystemState {
  revision: number;
  activePlan: PlannerResult | null;
  blockStatus: Record<string, PlanningBlockStatus>;
  activeSession?: ActivePlanningSession | null;
  context: {
    emotionState: EmotionState;
    burnoutRisk: "low" | "medium" | "high";
    energyLevel: "low" | "medium" | "high";
    updatedAt: string;
  };
  memory: PlanningMemoryEntry[];
  lastTrigger: string;
  aiAvailable?: boolean;
  aiProvider?: "gemini" | "openai" | "local";
  study: {
    plannedMinutes: number;
    completedMinutes: number;
    currentGoal: string | null;
  };
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
  currentContext?: {
    emotionState: EmotionState;
    burnoutRisk: "low" | "medium" | "high";
    updatedAt: string;
  };
  planning?: PlanningSystemState;
  survivalMode?: {
    active: boolean;
    activatedAt: string;
    originalTasks: TaskItem[];
  } | null;
}
