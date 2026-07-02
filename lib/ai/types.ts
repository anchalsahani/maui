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
  microSteps: string[];
}

export interface PlannerDayBlock {
  timeLabel: string;
  title: string;
  goal: string;
  actions: string[];
  adhdNote: string;
  energy: "low" | "medium" | "high";
}

export type PlannerStrategyType =
  | "parallel_options"
  | "alternating_loops"
  | "deadline_triage"
  | "burnout_protection"
  | "interruption_reentry";

export interface PlannerDetectedObligation {
  id: string;
  label: string;
  category: "study" | "chore" | "commitment" | "wellbeing" | "admin";
  urgency: "low" | "medium" | "high";
  whyItMatters: string;
}

export interface PlannerParallelOption {
  label: string;
  bestWhen: string;
  firstAction: string;
  reentryAction: string;
}

export interface PlannerSituationMap {
  detectedObligations: PlannerDetectedObligation[];
  constraints: string[];
  emotionalState: EmotionState;
  emotionReason: string;
  timePressure: "low" | "medium" | "high";
  strategyType: PlannerStrategyType;
  parallelOptions: PlannerParallelOption[];
  enoughForToday: string;
}

export interface PlannerResult {
  situation: PlannerSituationMap;
  plan: PlannerAllocation[];
  headline: string;
  framing: string;
  dayAtGlance: PlannerDayBlock[];
  priorityOrder: string[];
  hardRules: string[];
  emergencyProtocol: string[];
  realisticOutcome: string[];
  todayStrategy: string;
  avoidedOverload: string;
}

export interface PlannerRequestInput {
  availableMinutes?: number;
  emotionState?: EmotionState;
  burnoutRisk?: BurnoutRisk;
  rantContext?: string;
  todayNotes?: string;
  tasks?: TaskItem[];
  survey?: UserSurvey | null;
}

export interface TaskBreakdownResult {
  title: string;
  contextNote: string;
  microSteps: string[];
  stuckReason: string;
}
