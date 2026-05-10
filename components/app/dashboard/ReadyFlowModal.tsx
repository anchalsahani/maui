"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import type { TaskItem, SessionState } from "./types";
import FocusTimer from "./FocusTimer";

export default function ReadyFlowModal({
  nextTask,
  session,
  onStart,
  onPauseResume,
  onComplete,
}: {
  nextTask: TaskItem | null;
  session: SessionState;
  onStart: () => void;
  onPauseResume: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,250,247,0.9))] p-5"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
          Next task
        </p>
        <h3 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
          {nextTask?.title ?? "No task available"}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {nextTask
            ? "Start the 20-minute pomodoro and let the timer carry the first block for you."
            : "There is no task ready yet. Add one gentle task and this flow will be ready."}
        </p>

        {nextTask ? (
          <div className="mt-5 space-y-3">
            {nextTask.steps.slice(0, 4).map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index }}
                className="flex items-start gap-3 rounded-[20px] bg-white/72 px-4 py-3"
              >
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                <p className="text-sm leading-6 text-[var(--color-dark)]/84">{step}</p>
              </motion.div>
            ))}
          </div>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-5"
      >
        <FocusTimer />

        <div className="grid gap-3">
          <button
            type="button"
            onClick={onStart}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-primary-deep)] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-dark)] hover:shadow-[0_18px_36px_rgba(16,47,21,0.16)]"
          >
            Start 20 minutes
            <ArrowRight size={16} />
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onPauseResume}
              disabled={session.status === "idle" || session.status === "completed"}
              className="flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/82 text-sm font-medium text-[var(--color-dark)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {session.status === "active" ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={onComplete}
              disabled={session.status === "idle"}
              className="flex h-11 items-center justify-center rounded-full border border-[var(--color-primary)]/28 bg-[var(--color-accent)]/48 text-sm font-semibold text-[var(--color-primary-deep)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Complete +8
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
