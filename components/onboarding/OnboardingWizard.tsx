"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleGauge,
  Cloud,
  Layers3,
  Loader2,
  Sparkles,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  OnboardingDraft,
  UserSurvey,
} from "@/lib/auth/types";

const questions = [
  {
    key: "focusWindow",
    eyebrow: "Focus",
    title: "What focus window usually feels safest?",
    support: "Choose what feels realistic on an ordinary day—not your best day.",
    icon: CircleGauge,
    options: [
      { value: "short", label: "Short", description: "5–15 gentle minutes" },
      { value: "medium", label: "Medium", description: "15–30 focused minutes" },
      { value: "flexible", label: "Flexible", description: "Let Maui adjust each day" },
    ],
  },
  {
    key: "taskPace",
    eyebrow: "Task size",
    title: "How should Maui break work down?",
    support: "You can change this later. Pick the size that makes starting easier.",
    icon: Layers3,
    options: [
      { value: "tiny", label: "Tiny steps", description: "One visible action at a time" },
      { value: "balanced", label: "Balanced", description: "A few clear steps" },
      { value: "deep", label: "Deeper blocks", description: "Fewer, larger chunks" },
    ],
  },
  {
    key: "overwhelmTrigger",
    eyebrow: "Friction",
    title: "Where do you get stuck most often?",
    support: "There is no wrong answer. This helps Maui intervene at the right moment.",
    icon: Cloud,
    options: [
      { value: "starting", label: "Starting", description: "Beginning is the hardest part" },
      { value: "planning", label: "Planning", description: "Too many choices create a freeze" },
      { value: "finishing", label: "Finishing", description: "Closing the loop is difficult" },
      { value: "switching", label: "Switching", description: "Context changes break momentum" },
    ],
  },
  {
    key: "supportStyle",
    eyebrow: "Support",
    title: "What tone should Maui use with you?",
    support: "Maui will use this tone for prompts, plans, and difficult moments.",
    icon: Sparkles,
    options: [
      { value: "gentle", label: "Gentle", description: "Soft and low-pressure" },
      { value: "direct", label: "Direct", description: "Clear and practical" },
      { value: "encouraging", label: "Encouraging", description: "Warm and reassuring" },
    ],
  },
  {
    key: "energyPattern",
    eyebrow: "Energy",
    title: "How does your energy usually behave?",
    support: "Think about the pattern Maui should plan around most often.",
    icon: Waves,
    options: [
      { value: "steady", label: "Mostly steady", description: "Stable once I begin" },
      { value: "waves", label: "Comes in waves", description: "Good and difficult bursts" },
      { value: "low", label: "Often low", description: "I may begin already drained" },
    ],
  },
] as const;

type Question = (typeof questions)[number];
type QuestionKey = Question["key"];

export default function OnboardingWizard({
  initialSurvey,
  initialDraft,
  firstName,
}: {
  initialSurvey: UserSurvey | null;
  initialDraft: OnboardingDraft | null;
  firstName: string;
}) {
  const router = useRouter();
  const initialAnswers = useMemo<OnboardingDraft>(
    () => ({ ...(initialSurvey ?? {}), ...(initialDraft ?? {}) }),
    [initialDraft, initialSurvey]
  );
  const firstUnanswered = questions.findIndex(
    (question) => !initialAnswers[question.key]
  );
  const [step, setStep] = useState(firstUnanswered < 0 ? 0 : firstUnanswered);
  const [answers, setAnswers] = useState<OnboardingDraft>(initialAnswers);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");
  const question = questions[step];
  const selectedValue = answers[question.key];
  const progress = ((step + 1) / questions.length) * 100;

  async function chooseAnswer(key: QuestionKey, value: string) {
    const nextAnswers = { ...answers, [key]: value } as OnboardingDraft;
    setAnswers(nextAnswers);
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Your answer could not be saved.");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Your answer could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function continueForward() {
    if (!selectedValue || isSaving) {
      return;
    }

    if (step < questions.length - 1) {
      setStep((current) => current + 1);
      setError("");
      return;
    }

    setIsCompleting(true);
    setError("");

    try {
      const response = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Could not finish your setup.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not finish your setup."
      );
      setIsCompleting(false);
    }
  }

  const QuestionIcon = question.icon;

  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-[var(--color-bg)] px-4 py-5 sm:px-6">
      <div className="app-page-wash pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-[8%] top-[12%] h-64 w-64 rounded-full bg-[var(--color-accent)]/25 blur-[72px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[8%] h-72 w-72 rounded-full bg-[var(--color-primary)]/10 blur-[80px]" />

      <div className="relative mx-auto w-full max-w-3xl">
        <header className="mb-5 flex items-center justify-between gap-4 sm:mb-7">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full text-[var(--color-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label="Maui home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-button-primary)] text-sm font-bold text-[var(--color-button-primary-text)]">
              M
            </span>
            <span className="font-[var(--font-heading)] text-lg font-semibold">Maui</span>
          </Link>

          <div
            className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]"
            role="status"
            aria-live="polite"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isSaving ? "Saving…" : "Answers saved"}
          </div>
        </header>

        <section className="app-card-strong overflow-hidden rounded-[28px] sm:rounded-[34px]">
          <div
            className="h-1.5 bg-[var(--color-border)]"
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-valuenow={step + 1}
          >
            <div
              className="h-full rounded-r-full bg-[var(--color-button-primary)] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
                Question {step + 1} of {questions.length}
              </p>
              <span className="text-xs text-[var(--color-text-secondary)]">
                Hi {firstName}
              </span>
            </div>

            <div key={question.key} className="maui-question-enter mt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/55 text-[var(--color-primary-deep)]">
                <QuestionIcon size={20} aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.17em] text-[var(--color-text-secondary)]">
                {question.eyebrow}
              </p>
              <h1 className="mt-2 max-w-2xl text-[clamp(1.7rem,5vw,2.55rem)] font-semibold leading-[1.06] tracking-[-0.045em]">
                {question.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-[15px]">
                {question.support}
              </p>

              <fieldset className="mt-6 grid gap-2.5 sm:grid-cols-2">
                <legend className="sr-only">{question.title}</legend>
                {question.options.map((option) => {
                  const selected = selectedValue === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`group flex cursor-pointer items-start gap-3 rounded-[18px] border p-3.5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 ${
                        selected
                          ? "border-[var(--color-primary)] bg-[var(--color-accent)]/38"
                          : "border-[var(--color-border)] bg-[var(--color-card-soft)] hover:border-[var(--color-primary)]/45 hover:bg-[var(--color-card-hover)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.key}
                        value={option.value}
                        checked={selected}
                        onChange={() => void chooseAnswer(question.key, option.value)}
                        className="sr-only"
                      />
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-[var(--color-button-primary)] bg-[var(--color-button-primary)] text-[var(--color-button-primary-text)]"
                            : "border-[var(--color-border-strong)]"
                        }`}
                        aria-hidden="true"
                      >
                        {selected ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[var(--color-dark)]">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--color-text-secondary)]">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </div>

            {error ? (
              <p
                className="mt-4 rounded-2xl border border-[var(--color-error)]/25 bg-[var(--color-error)]/8 px-4 py-3 text-sm text-[var(--color-error)]"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-5">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0 || isCompleting}
                className="maui-button-secondary inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                onClick={() => void continueForward()}
                disabled={!selectedValue || isSaving || isCompleting}
                className="maui-button-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isCompleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Preparing Maui
                  </>
                ) : (
                  <>
                    {step === questions.length - 1 ? "Finish setup" : "Next"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <p className="mt-4 text-center text-xs leading-5 text-[var(--color-text-secondary)]">
          Your answers shape task size, pacing, and support. You can change them later.
        </p>
      </div>
    </main>
  );
}
