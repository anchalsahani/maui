"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { TaskItem } from "./types";
import FocusTimer from "./FocusTimer";
import { useFocusTimer } from "./useFocusTimer";

const durationOptions = [20, 25, 40, 45];

export default function ReadyFlowModal({
  nextTask,
  selectedMinutes,
  onDurationChange,
  onStart,
  onPauseResume,
  onComplete,
}: {
  nextTask: TaskItem | null;
  selectedMinutes: number;
  onDurationChange: (minutes: number) => void;
  onStart: () => void;
  onPauseResume: () => void;
  onComplete: () => void;
}) {
  const timer = useFocusTimer();
  const canPauseOrResume = timer.status === "active" || timer.status === "paused";
  const startLabel = timer.status === "active" || timer.status === "paused"
    ? "Restart focus block"
    : `Start ${selectedMinutes} minutes`;
  const titleLength = nextTask?.title.length ?? 0;
  const titleSizeClass =
    titleLength > 120
      ? "text-[1.05rem] sm:text-[1.15rem]"
      : titleLength > 80
        ? "text-[1.18rem] sm:text-[1.35rem]"
        : "text-[clamp(1.35rem,3vw,2rem)]";

  return (
    <div className="grid min-h-[440px] gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full flex-col rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,250,247,0.9))] p-4 sm:p-5"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
          Current session
        </p>
        <h3 className={`mt-3 break-words font-semibold leading-tight tracking-[-0.04em] text-[var(--color-dark)] ${titleSizeClass}`}>
          {nextTask?.title ?? "No task available"}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {nextTask
            ? "Choose a focus length, start once, and let the timer carry the block without losing state."
            : "There is no task ready yet. Add one gentle task and this flow will be ready."}
        </p>
        <div className="mt-auto h-24 rounded-[24px] bg-[linear-gradient(180deg,rgba(207,232,213,0.18),rgba(255,255,255,0.5))]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full flex-col gap-4"
      >
        <FocusTimer onAutoComplete={onComplete} />

        <div className="mt-auto grid gap-3 rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,248,0.82))] p-4 sm:p-5">
          <div className="grid grid-cols-4 gap-2 rounded-[22px] border border-[var(--color-border)] bg-white/72 p-2">
            {durationOptions.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => onDurationChange(minutes)}
                disabled={timer.status === "active"}
                className={`h-10 rounded-full text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${
                  selectedMinutes === minutes
                    ? "bg-[var(--color-primary-deep)] text-white shadow-[0_10px_22px_rgba(16,47,21,0.12)]"
                    : "bg-white/80 text-[var(--color-dark)] hover:-translate-y-0.5 hover:bg-[var(--color-accent)]/55"
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onStart}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-primary-deep)] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-dark)] hover:shadow-[0_18px_36px_rgba(16,47,21,0.16)]"
          >
            {startLabel}
            <ArrowRight size={16} />
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onPauseResume}
              disabled={!canPauseOrResume}
              className="flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/82 text-sm font-medium text-[var(--color-dark)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {timer.status === "active" ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={onComplete}
              disabled={timer.status === "idle" || timer.status === "completed"}
              className="flex h-11 items-center justify-center rounded-full border border-[var(--color-primary)]/28 bg-[var(--color-accent)]/48 text-sm font-semibold text-[var(--color-primary-deep)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={15} className="mr-1.5" />
              Complete session
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
