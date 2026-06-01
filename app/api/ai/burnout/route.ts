import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  AIProviderUnavailableError,
  createStructuredResponse,
} from "@/lib/ai/provider";
import type { BurnoutAnalysis } from "@/lib/ai/types";

export const runtime = "nodejs";

const burnoutSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "state",
    "burnoutRisk",
    "confidence",
    "title",
    "signals",
    "suggestedAdjustment",
    "nextStep",
    "crisisFlag",
  ],
  properties: {
    state: {
      type: "string",
      enum: ["steady", "stressed", "tired", "overwhelmed", "hopeful"],
    },
    burnoutRisk: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    title: {
      type: "string",
      maxLength: 90,
    },
    signals: {
      type: "array",
      minItems: 0,
      maxItems: 6,
      items: {
        type: "string",
        maxLength: 36,
      },
    },
    suggestedAdjustment: {
      type: "string",
      maxLength: 240,
    },
    nextStep: {
      type: "string",
      maxLength: 160,
    },
    crisisFlag: {
      type: "boolean",
    },
  },
};

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rant = getString(body, "rant").slice(0, 1200);

  if (!rant.trim()) {
    return NextResponse.json({ error: "Rant text is required." }, { status: 400 });
  }

  const fallback = buildFallbackBurnoutAnalysis(rant);

  try {
    const analysis = await createStructuredResponse<BurnoutAnalysis>({
      name: "burnout_analysis",
      schema: burnoutSchema,
      instructions:
        "You are Maui's supportive planning assistant. Analyze the user's short rant as a productivity support signal, not a medical diagnosis. Keep language gentle, concrete, and non-clinical. If the text suggests self-harm, immediate danger, or inability to stay safe, set crisisFlag true and make nextStep about contacting trusted human or emergency support instead of productivity.",
      input: {
        rant,
        userSurvey: user.survey,
        studyProfile: user.studyProfile
          ? {
              studying: user.studyProfile.studying,
              goal: user.studyProfile.goal,
              taskCount: user.studyProfile.generatedTasks.length,
            }
          : null,
        context: getObject(body, "context"),
      },
    });

    return NextResponse.json({ analysis, aiAvailable: true });
  } catch (error) {
    if (!(error instanceof AIProviderUnavailableError)) {
      console.error("Burnout analysis failed", error);
    }

    return NextResponse.json({
      analysis: fallback,
      aiAvailable: false,
      warning:
        error instanceof AIProviderUnavailableError
          ? `${error.message} Returned local fallback analysis.`
          : "AI analysis failed. Returned local fallback analysis.",
    });
  }
}

function getString(body: unknown, key: string) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function getObject(body: unknown, key: string) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const value = (body as Record<string, unknown>)[key];
  return value && typeof value === "object" ? value : null;
}

function buildFallbackBurnoutAnalysis(input: string): BurnoutAnalysis {
  const text = input.toLowerCase();
  const signals = [
    "stuck",
    "overwhelmed",
    "panic",
    "stress",
    "deadline",
    "tired",
    "drained",
    "exhausted",
    "sad",
    "anxious",
    "ready",
    "okay",
    "hopeful",
  ].filter((keyword) => text.includes(keyword));

  if (/(suicide|self harm|kill myself|end it|not safe)/.test(text)) {
    return {
      state: "overwhelmed",
      burnoutRisk: "high",
      confidence: 0.9,
      title: "This needs human support.",
      signals: ["safety concern", ...signals].slice(0, 6),
      suggestedAdjustment:
        "Pause productivity decisions right now and focus on getting support from a trusted person or local emergency service.",
      nextStep: "Contact someone you trust or emergency support now.",
      crisisFlag: true,
    };
  }

  if (/(panic|spiral|overwhelmed|too much|freeze|stuck)/.test(text)) {
    return {
      state: "overwhelmed",
      burnoutRisk: "high",
      confidence: 0.74,
      title: "You sound overloaded.",
      signals,
      suggestedAdjustment:
        "Lower the pressure, avoid a full plan, and turn the next task into one visible action.",
      nextStep: "Pick the easiest task and only open the material.",
      crisisFlag: false,
    };
  }

  if (/(tired|exhausted|drained|sleepy|burnt|burned)/.test(text)) {
    return {
      state: "tired",
      burnoutRisk: "medium",
      confidence: 0.7,
      title: "Low energy is showing up.",
      signals,
      suggestedAdjustment:
        "Use a lighter block and avoid deep work until energy comes back.",
      nextStep: "Do a 10 minute review or setup step.",
      crisisFlag: false,
    };
  }

  if (/(stress|anxious|pressure|deadline|worried)/.test(text)) {
    return {
      state: "stressed",
      burnoutRisk: "medium",
      confidence: 0.68,
      title: "Stress is showing up here.",
      signals,
      suggestedAdjustment:
        "Make the next move concrete and short so the deadline pressure does not expand the task.",
      nextStep: "Choose one task and write the first two actions.",
      crisisFlag: false,
    };
  }

  if (/(ready|okay|good|better|hopeful)/.test(text)) {
    return {
      state: "hopeful",
      burnoutRisk: "low",
      confidence: 0.62,
      title: "There is some momentum here.",
      signals,
      suggestedAdjustment:
        "Use the momentum for a normal task block before switching contexts.",
      nextStep: "Start the highest value task for one focused block.",
      crisisFlag: false,
    };
  }

  return {
    state: "steady",
    burnoutRisk: "low",
    confidence: 0.55,
    title: "A steady state for now.",
    signals,
    suggestedAdjustment:
      "Offer one calm next step without adding planning pressure.",
    nextStep: "Start with a small visible action.",
    crisisFlag: false,
  };
}
