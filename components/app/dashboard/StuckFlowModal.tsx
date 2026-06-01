"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import type { RewardState, TaskItem } from "./types";

export default function StuckFlowModal({
  nextTask,
  microSteps,
  completedCount,
  allMicroStepsDone,
  reward,
  breakdownTitle,
  breakdownNote,
  breakdownError,
  isGeneratingBreakdown,
  onToggleStep,
  onFinishTask,
  onResetSteps,
}: {
  nextTask: TaskItem | null;
  microSteps: string[];
  completedCount: number;
  allMicroStepsDone: boolean;
  reward: RewardState;
  breakdownTitle: string;
  breakdownNote: string;
  breakdownError: string;
  isGeneratingBreakdown: boolean;
  onToggleStep: (step: string) => void;
  onFinishTask: () => void;
  onResetSteps: () => void;
}) {
  const activeStep = allMicroStepsDone ? null : microSteps[completedCount] ?? null;
  const growthPercent =
    microSteps.length > 0 ? Math.round((completedCount / microSteps.length) * 100) : 0;
  const smileyPoints = reward.microTasksCompleted + reward.streak;

  return (
    <div className="grid min-h-[440px] gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full flex-col rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,250,247,0.9))] p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              AI broken-down task
            </p>
            <h3 className="mt-2 break-words text-[clamp(1.2rem,2.5vw,1.55rem)] font-semibold leading-tight tracking-[-0.04em] text-[var(--color-dark)]">
              {breakdownTitle || nextTask?.title || "No task available"}
            </h3>
            {breakdownNote ? (
              <p className="mt-2 text-sm leading-5 text-[var(--color-text-secondary)]">
                {breakdownNote}
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-white/82 px-3 py-1 text-xs font-medium text-[var(--color-primary-deep)]">
            {completedCount}/{microSteps.length}
          </span>
        </div>

        <div className="mt-4">
          {isGeneratingBreakdown ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[26px] border border-[var(--color-primary)]/24 bg-white/84 p-4 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <Loader2 className="mt-1 animate-spin text-[var(--color-primary-deep)]" size={22} />
                <div>
                  <p className="text-[1.08rem] font-semibold leading-6 text-[var(--color-dark)]">
                    Maui is making this task startable.
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    It is reading the task, your profile, and your current state.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : activeStep ? (
            <motion.button
              key={activeStep}
              type="button"
              onClick={() => onToggleStep(activeStep)}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className="w-full rounded-[26px] border border-[var(--color-primary)]/24 bg-white/84 p-4 text-left shadow-[0_18px_42px_rgba(53,85,63,0.08)] transition-all duration-200 hover:border-[var(--color-primary)]/42 hover:bg-white sm:p-5"
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 text-[var(--color-primary-deep)]">
                  <Circle size={22} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                    Step {completedCount + 1} of {microSteps.length}
                  </p>
                  <p className="mt-2 text-[1.08rem] font-semibold leading-6 text-[var(--color-dark)]">
                    {activeStep}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Tap once this one step is done.
                  </p>
                </div>
              </div>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[26px] border border-[var(--color-primary)]/24 bg-[var(--color-accent)]/42 p-4 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <CheckCircle2 className="mt-1 text-[var(--color-primary-deep)]" size={22} />
                <div>
                  <p className="text-[1.15rem] font-semibold text-[var(--color-dark)]">
                    All tiny steps are done.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Finish the task to collect the completion reward.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-4 flex gap-2">
            {microSteps.map((step, index) => {
              const done = index < completedCount;
              const active = index === completedCount && !allMicroStepsDone;

              return (
                <span
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                    done
                      ? "bg-[var(--color-primary-deep)]"
                      : active
                        ? "bg-[var(--color-primary)]"
                        : "bg-white/78"
                  }`}
                />
              );
            })}
          </div>

          {breakdownError ? (
            <p className="mt-3 rounded-[16px] border border-[var(--color-border)] bg-white/78 px-3 py-2 text-xs leading-5 text-[var(--color-text-secondary)]">
              {breakdownError}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onFinishTask}
              disabled={!allMicroStepsDone}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-[var(--color-primary-deep)] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Finish task +4
            </button>
            <button
              type="button"
              onClick={onResetSteps}
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/82 text-sm font-medium text-[var(--color-dark)] transition-all duration-200 hover:-translate-y-0.5"
            >
              Reset steps
            </button>
          </div>
        </div>
        <div className="mt-auto h-16 rounded-[24px] bg-[linear-gradient(180deg,rgba(207,232,213,0.18),rgba(255,255,255,0.5))]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full flex-col gap-4"
      >
        <div className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,248,0.82))] p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Reward path
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-white/80 px-4 py-3 text-center">
              <p className="text-[1.45rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
                {reward.microTasksCompleted}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Micro wins
              </p>
            </div>
            <div className="rounded-[22px] bg-white/80 px-4 py-3 text-center">
              <p className="text-[1.45rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
                {reward.points}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Total points
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-5 text-[var(--color-text-secondary)]">
            Each micro step gives +1. Finishing the broken-down task gives +4.
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(241,249,244,0.86))] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                Growth garden
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Each micro win adds a leaf.
              </p>
            </div>
            <motion.div
              key={smileyPoints}
              initial={{ scale: 0.84, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="rounded-full bg-white/84 px-3 py-2 text-sm font-semibold text-[var(--color-primary-deep)] shadow-[0_10px_24px_rgba(53,85,63,0.08)]"
            >
              :) {smileyPoints}
            </motion.div>
          </div>

          <div className="relative mt-3 h-28 overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,rgba(207,232,213,0.34),rgba(255,255,255,0.72))]">
            <div className="absolute inset-x-8 bottom-5 h-3 rounded-full bg-[var(--color-primary)]/18" />
            <motion.div
              className="absolute bottom-8 left-1/2 w-3 origin-bottom -translate-x-1/2 rounded-full bg-[var(--color-primary-deep)]"
              initial={false}
              animate={{ height: `${28 + growthPercent * 0.42}px` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />

            {microSteps.map((step, index) => {
              const visible = index < completedCount;
              const side = index % 2 === 0 ? -1 : 1;
              const bottom = 40 + index * 9;
              const offset = 14 + (index % 3) * 12;

              return (
                <motion.span
                  key={step}
                  className="absolute left-1/2 h-9 w-12 rounded-[999px_999px_999px_20px] bg-[var(--color-primary)]/72 shadow-[0_10px_22px_rgba(53,85,63,0.14)]"
                  initial={false}
                  animate={{
                    opacity: visible ? 1 : 0,
                    scale: visible ? 1 : 0.2,
                    rotate: side > 0 ? 28 : -28,
                    x: side * offset,
                    y: 0,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  style={{ bottom }}
                />
              );
            })}

            <motion.div
              key={completedCount}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: completedCount > 0 ? 1 : 0.55, y: 0, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="absolute bottom-3 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white text-lg shadow-[0_12px_30px_rgba(53,85,63,0.12)]"
            >
              :)
            </motion.div>
          </div>
        </div>

        <div className="min-h-0 flex-1 rounded-[28px] bg-[linear-gradient(180deg,rgba(207,232,213,0.16),rgba(255,255,255,0.46))]" />
      </motion.div>
    </div>
  );
}
