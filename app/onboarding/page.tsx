"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Brain, Sparkles } from "lucide-react";

const surveyGroups = [
  {
    key: "focusWindow",
    title: "What kind of focus window usually feels safest?",
    options: [
      { value: "short", label: "Short", description: "5 to 15 minute pushes" },
      { value: "medium", label: "Medium", description: "15 to 30 minute sessions" },
      { value: "flexible", label: "Flexible", description: "Adjust based on the day" },
    ],
  },
  {
    key: "taskPace",
    title: "How should Maui break your work down?",
    options: [
      { value: "tiny", label: "Tiny steps", description: "Very small, low-friction actions" },
      { value: "balanced", label: "Balanced", description: "A few clear steps at a time" },
      { value: "deep", label: "Deeper blocks", description: "Fewer, more substantial chunks" },
    ],
  },
  {
    key: "overwhelmTrigger",
    title: "Where do you get stuck most often?",
    options: [
      { value: "starting", label: "Starting", description: "Beginning is the hardest part" },
      { value: "planning", label: "Planning", description: "Structuring feels overwhelming" },
      { value: "finishing", label: "Finishing", description: "I start, but don't wrap up" },
      { value: "switching", label: "Switching", description: "Context changes break momentum" },
    ],
  },
  {
    key: "supportStyle",
    title: "What tone should Maui use with you?",
    options: [
      { value: "gentle", label: "Gentle", description: "Soft, low-pressure guidance" },
      { value: "direct", label: "Direct", description: "Clear and practical prompts" },
      { value: "encouraging", label: "Encouraging", description: "Warm motivation and reassurance" },
    ],
  },
  {
    key: "energyPattern",
    title: "How does your energy usually behave?",
    options: [
      { value: "steady", label: "Steady", description: "Mostly stable once I begin" },
      { value: "waves", label: "Waves", description: "Good and bad bursts through the day" },
      { value: "low", label: "Low", description: "I often start already drained" },
    ],
  },
] as const;

type SurveyState = Record<(typeof surveyGroups)[number]["key"], string>;

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [survey, setSurvey] = useState<SurveyState>({
    focusWindow: "short",
    taskPace: "tiny",
    overwhelmTrigger: "starting",
    supportStyle: "gentle",
    energyPattern: "waves",
  });

  async function handleSubmit() {
    setError("");

    const response = await fetch("/api/profile/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(survey),
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      setError(data?.error ?? "Could not save your setup yet.");
      return;
    }

    const form = document.querySelector<HTMLFormElement>("#study-profile-form");

    if (form) {
      const personalizationData = new FormData(form);
      const studying = String(personalizationData.get("studying") ?? "").trim();
      const manualSyllabus = String(personalizationData.get("manualSyllabus") ?? "").trim();
      const syllabusFile = personalizationData.get("syllabusFile");

      const hasUpload = syllabusFile instanceof File && syllabusFile.size > 0;

      if (studying && (manualSyllabus || hasUpload)) {
        const profileResponse = await fetch("/api/profile/personalization", {
          method: "POST",
          body: personalizationData,
        });

        const profileData = (await profileResponse.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!profileResponse.ok) {
          setError(profileData?.error ?? "Setup saved, but syllabus processing failed.");
          return;
        }
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[-8%] top-[-8%] h-[520px] w-[520px] rounded-full bg-[var(--color-accent)]/65 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-8%] h-[520px] w-[520px] rounded-full bg-[var(--color-primary)]/18 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_30px_100px_rgba(53,85,63,0.12)] backdrop-blur-2xl sm:p-8 lg:p-10">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)]/55 px-4 py-2 text-sm font-medium text-[var(--color-primary-deep)]">
            <Sparkles size={16} />
            Personalize your Maui flow
          </div>

          <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[0.94] tracking-[-0.06em] text-[var(--color-dark)]">
            A quick setup so Maui can work with your brain.
          </h1>

          <p className="max-w-2xl text-[15px] leading-7 text-[var(--color-text-secondary)] sm:text-[16px]">
            This is a short ADHD-oriented setup. Your answers will shape task size,
            session length, support style, and fallback behavior across the app.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          {surveyGroups.map((group) => (
            <section
              key={group.key}
              className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(244,250,246,0.9))] p-5 shadow-[0_12px_35px_rgba(53,85,63,0.06)]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/55 text-[var(--color-primary-deep)]">
                  <Brain size={18} />
                </div>
                <div className="flex-1">
                  <h2 className="text-[1.1rem] font-semibold text-[var(--color-dark)]">
                    {group.title}
                  </h2>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.options.map((option) => {
                      const selected = survey[group.key] === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setSurvey((current) => ({
                              ...current,
                              [group.key]: option.value,
                            }))
                          }
                          className={`rounded-[22px] border px-4 py-4 text-left transition-all duration-200 ${
                            selected
                              ? "border-[var(--color-primary)]/45 bg-[var(--color-accent)]/45 shadow-[0_12px_24px_rgba(53,85,63,0.08)]"
                              : "border-[var(--color-border)] bg-white/78 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/28 hover:bg-white"
                          }`}
                        >
                          <p className="text-sm font-semibold text-[var(--color-dark)]">
                            {option.label}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <form
          id="study-profile-form"
          className="mt-5 rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(244,250,246,0.9))] p-5 shadow-[0_12px_35px_rgba(53,85,63,0.06)]"
        >
          <h2 className="text-[1.1rem] font-semibold text-[var(--color-dark)]">
            What are you studying?
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            This helps Maui parse your syllabus and generate study tasks. You can
            change it anytime from Personalization.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              name="studying"
              className="input"
              placeholder="B.Tech CSE, UPSC, NEET, Class 12 PCM..."
              disabled={isPending}
            />
            <select name="goal" className="input" defaultValue="exam" disabled={isPending}>
              <option value="exam">Exam preparation</option>
              <option value="course">Course completion</option>
              <option value="skill">Skill building</option>
              <option value="revision">Revision cycle</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <textarea
              name="manualSyllabus"
              className="input min-h-32 resize-y"
              placeholder="Paste subjects, modules, chapters, or topics here."
              disabled={isPending}
            />
            <label className="flex min-h-32 cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-[var(--color-primary)]/35 bg-white/62 px-4 py-4 text-sm text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--color-dark)]">
                Upload complete syllabus
              </span>
              <span className="mt-1">PDF, DOC, DOCX, or TXT</span>
              <input
                name="syllabusFile"
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="mt-3 text-xs"
                disabled={isPending}
              />
            </label>
          </div>

          <textarea
            name="preferences"
            className="input mt-3 min-h-20 resize-y"
            placeholder="Optional: target date, daily study time, weak subjects, coaching schedule..."
            disabled={isPending}
          />
        </form>

        {error ? (
          <p className="mt-6 rounded-2xl border border-[var(--color-error)]/25 bg-[var(--color-error)]/8 px-4 py-3 text-sm text-[var(--color-error)]">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
            You can change these later in settings. Right now, we&apos;re just trying
            to give you a gentler starting point.
          </p>

          <button
            type="button"
            onClick={() => startTransition(() => void handleSubmit())}
            disabled={isPending}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-primary-deep)] px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Saving setup..." : "Continue to dashboard"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
