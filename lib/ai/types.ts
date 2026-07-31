import type { EmotionState, TaskItem } from "@/components/app/dashboard/types";
import type { UserSurvey } from "@/lib/auth/types";

export type BurnoutRisk = "low" | "medium" | "high";

export interface BurnoutAnalysis {
  state: EmotionState;
  burnoutRisk: BurnoutRisk;
  confidence: number;
  title: string;
  signals: string[];
  suggestedAdjustment: string;
  nextStep: string;
  crisisFlag: boolean;
}

export interface PlannerAllocation {
  taskId: string;
  title: string;
  focusMinutes: number;
  intensity: "light" | "balanced" | "deep";
  reason: string;
}

export type PlannerBlockType =
  | "reset"
  | "focus"
  | "recovery"
  | "admin"
  | "commitment"
  | "rest";

export interface PlannerScheduleBlock {
  id: string;
  type: PlannerBlockType;
  startTime: string;
  endTime: string;
  title: string;
  taskId: string;
  durationMinutes: number;
  energy: "low" | "medium" | "high";
  priority: "low" | "medium" | "high";
  reason: string;
  expectedOutcome: string;
  firstStep?: string;
  mission?: string;
  cognitiveLoad?: "light" | "moderate" | "heavy";
  confidence?: "low" | "medium" | "high";
  smallerVersion?: string;
  recoveryVersion?: string;
  conditional: string;
}

export interface PlannerEnergyForecast {
  period: string;
  level: "low" | "medium" | "high";
  guidance: string;
}

export interface PlannerPostponedItem {
  taskId: string;
  title: string;
  reason: string;
  revisit: string;
}

export interface PlannerAssessment {
  emotionalState: EmotionState;
  emotionalSummary: string;
  capacitySummary: string;
  workloadSummary: string;
  keyTradeoff: string;
  confidence: "low" | "medium" | "high";
}

export interface PlannerResult {
  generatedAt: string;
  planningWindow: {
    startTime: string;
    endTime: string;
    totalAvailableMinutes: number;
  };
  headline: string;
  strategy: string;
  todayFocus: string;
  assessment: PlannerAssessment;
  energyForecast: PlannerEnergyForecast[];
  schedule: PlannerScheduleBlock[];
  postponed: PlannerPostponedItem[];
  reassessment: string;
  plan: PlannerAllocation[];
}

export interface PlannerRequestInput {
  availableMinutes?: number;
  currentTime?: string;
  timezone?: string;
  energyLevel?: "low" | "medium" | "high";
  emotionState?: EmotionState;
  burnoutRisk?: BurnoutRisk;
  rantContext?: string;
  todayNotes?: string;
  replanTrigger?: string;
  tasks?: TaskItem[];
  survey?: UserSurvey | null;
}

export interface TaskBreakdownResult {
  title: string;
  contextNote: string;
  microSteps: string[];
  stuckReason: string;
}
