"use client";

import { useState } from "react";
import { Brain, Loader2, ShieldAlert } from "lucide-react";

import type { BurnoutAnalysis } from "@/lib/ai/types";
import type { UserSurvey } from "@/lib/auth/types";
import { announcePlanningUpdate } from "@/lib/planning/client-sync";

interface BurnoutWorkspaceProps {
  survey: UserSurvey | null;
}

export default function BurnoutWorkspace({ survey }: BurnoutWorkspaceProps) {
  const [rant, setRant] = useState("");
  const [analysis, setAnalysis] = useState<BurnoutAnalysis | null>(null);
  const [warning, setWarning] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [planMessage, setPlanMessage] = useState("");

  async function analyzeRant() {
    setIsAnalyzing(true);
    setWarning("");
    setPlanMessage("");

    try {
      const response = await fetch("/api/ai/burnout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rant,
          context: {
            energyPattern: survey?.energyPattern,
            supportStyle: survey?.supportStyle,
          },
        }),
      });
      const data = (await response.json()) as {
        analysis?: BurnoutAnalysis;
        warning?: string;
        error?: string;
      };

      if (!response.ok || !data.analysis) {
        throw new Error(data.error ?? "Analysis failed.");
      }

      setAnalysis(data.analysis);
      setWarning(data.warning ?? "");
      await updateSharedPlan(data.analysis);
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function updateSharedPlan(nextAnalysis: BurnoutAnalysis) {
    const energyLevel =
      nextAnalysis.state === "tired" || nextAnalysis.state === "overwhelmed"
        ? "low"
        : nextAnalysis.state === "hopeful"
          ? "high"
          : "medium";

    try {
      const eventResponse = await fetch("/api/planning/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "context_changed",
          emotionState: nextAnalysis.state,
          burnoutRisk: nextAnalysis.burnoutRisk,
          energyLevel,
          summary: "Burnout check-in changed Maui’s capacity read.",
        }),
      });
      const eventData = (await eventResponse.json().catch(() => null)) as
        | { revision?: number }
        | null;
      const planResponse = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          availableMinutes: 300,
          emotionState: nextAnalysis.state,
          burnoutRisk: nextAnalysis.burnoutRisk,
          energyLevel,
          todayNotes: nextAnalysis.crisisFlag
            ? "Protect recovery immediately. Keep only essential work and explain what was postponed."
            : "Adjust today around the latest burnout check-in. Reduce unnecessary pressure.",
          replanTrigger: "burnout_checkin",
        }),
      });
      const planData = (await planResponse.json().catch(() => null)) as
        | { revision?: number }
        | null;

      if (planResponse.ok) {
        announcePlanningUpdate(planData?.revision ?? Date.now());
        setPlanMessage("Maui updated today’s shared plan to match this check-in.");
      } else if (eventResponse.ok) {
        announcePlanningUpdate(eventData?.revision ?? Date.now());
        setPlanMessage("Maui saved this capacity signal for your next plan.");
      }
    } catch {
      setPlanMessage("This check-in is saved locally. Maui will use it the next time you plan.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,250,250,0.96))]" />

      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-5 pb-14 pt-24 lg:grid-cols-[1fr_1fr]">
        <section className="app-card rounded-[28px] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-deep)]">
            <Brain size={17} />
            Burnout
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight text-[var(--color-dark)] sm:text-4xl">
            Rant check-in
          </h1>
          <textarea
            value={rant}
            onChange={(event) => setRant(event.target.value)}
            maxLength={1200}
            className="input mt-6 min-h-[320px] w-full resize-none"
            placeholder="Drop the messy version here."
          />
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>{rant.length}/1200</span>
            <span className="capitalize">{survey?.supportStyle ?? "gentle"} support</span>
          </div>
          <button
            type="button"
            onClick={analyzeRant}
            disabled={isAnalyzing || rant.trim().length === 0}
            className="maui-button-primary mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={17} /> : <Brain size={17} />}
            Analyze rant
          </button>
          {warning ? (
            <p className="app-subcard mt-4 rounded-[18px] p-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {warning}
            </p>
          ) : null}
        </section>

        <section className="app-card rounded-[28px] p-5 sm:p-6">
          {analysis ? (
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-primary-deep)]">
                    {analysis.state}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[var(--color-dark)]">
                    {analysis.title}
                  </h2>
                </div>
                <span className="rounded-full bg-[var(--color-accent)]/65 px-3 py-1 text-xs font-semibold capitalize text-[var(--color-primary-deep)]">
                  {analysis.burnoutRisk} risk
                </span>
              </div>

              {analysis.crisisFlag ? (
                <div className="mt-5 flex gap-3 rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
                  <ShieldAlert className="mt-0.5 shrink-0" size={18} />
                  <p>{analysis.nextStep}</p>
                </div>
              ) : null}

              <div className="mt-5 grid gap-3">
                <p className="rounded-[20px] bg-[var(--color-accent)]/36 p-4 text-sm leading-6 text-[var(--color-dark)]">
                  {analysis.suggestedAdjustment}
                </p>
                <p className="rounded-[20px] bg-[var(--color-bg)] p-4 text-sm leading-6 text-[var(--color-dark)]">
                  {analysis.nextStep}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  Signals
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.signals.length > 0 ? (
                    analysis.signals.map((signal) => (
                      <span
                        key={signal}
                        className="rounded-full border border-[var(--color-border)] bg-[var(--color-card-soft)] px-3 py-1.5 text-xs text-[var(--color-dark)]"
                      >
                        {signal}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-card-soft)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)]">
                      No strong signals
                    </span>
                  )}
                </div>
              </div>
              {planMessage ? (
                <p className="app-muted-card mt-5 rounded-[18px] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {planMessage}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="app-muted-card flex h-full min-h-[420px] items-center justify-center rounded-[22px] border-dashed p-6 text-center text-sm leading-6 text-[var(--color-text-secondary)]">
              Your analysis will appear here.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
