"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

import type { RewardState, TaskItem } from "./types";

export default function StuckFlowModal({
  nextTask,
  microSteps,
  completedMicroSteps,
  completedCount,
  allMicroStepsDone,
  reward,
  onToggleStep,
  onFinishTask,
  onResetSteps,
}: {
  nextTask: TaskItem | null;
  microSteps: string[];
  completedMicroSteps: string[];
  completedCount: number;
  allMicroStepsDone: boolean;
  reward: RewardState;
  onToggleStep: (step: string) => void;
  onFinishTask: () => void;
  onResetSteps: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,250,247,0.9))] p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Broken-down task
            </p>
            <h3 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
              {nextTask?.title ?? "No task available"}
            </h3>
          </div>
          <span className="rounded-full bg-white/82 px-3 py-1 text-xs font-medium text-[var(--color-primary-deep)]">
            {completedCount}/{microSteps.length}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {microSteps.map((step, index) => {
            const done = completedMicroSteps.includes(step);

            return (
              <motion.button
                key={step}
                type="button"
                onClick={() => onToggleStep(step)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * index }}
                whileHover={{ x: 4 }}
                className={`flex w-full items-start gap-3 rounded-[22px] border px-4 py-4 text-left transition-all duration-200 ${
                  done
                    ? "border-[var(--color-primary)]/35 bg-[var(--color-accent)]/42"
                    : "border-[var(--color-border)] bg-white/80 hover:border-[var(--color-primary)]/24 hover:bg-white"
                }`}
              >
                <span className="mt-0.5 text-[var(--color-primary-deep)]">
                  {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--color-dark)]">{step}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {done ? "Completed. +1 point added." : "Tap when this step is done."}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-5"
      >
        <div className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,248,0.82))] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Reward path
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-white/80 px-4 py-4 text-center">
              <p className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
                {reward.microTasksCompleted}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Micro wins
              </p>
            </div>
            <div className="rounded-[22px] bg-white/80 px-4 py-4 text-center">
              <p className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
                {reward.points}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Total points
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Every completed micro step gives `+1`, and finishing the full broken-down task gives `+4`.
          </p>
        </div>

        <div className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,248,0.82))] p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onFinishTask}
              disabled={!allMicroStepsDone}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-[var(--color-primary-deep)] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Finish task +4
            </button>
            <button
              type="button"
              onClick={onResetSteps}
              className="flex h-12 flex-1 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/82 text-sm font-medium text-[var(--color-dark)] transition-all duration-200 hover:-translate-y-0.5"
            >
              Reset steps
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
