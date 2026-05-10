"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

import type { EmotionState } from "./types";

export default function TiredFlowModal({
  emotionInput,
  emotionState,
  emotionKeywords,
  emotionTitle,
  emotionBody,
  onEmotionChange,
  onAnalyze,
}: {
  emotionInput: string;
  emotionState: EmotionState;
  emotionKeywords: string[];
  emotionTitle: string;
  emotionBody: string;
  onEmotionChange: (value: string) => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,250,247,0.9))] p-5"
      >
        <textarea
          value={emotionInput}
          onChange={(event) => onEmotionChange(event.target.value)}
          className="input min-h-[220px] resize-none"
          placeholder="Example: I feel overwhelmed, drained, and I keep avoiding the task because it feels too big..."
        />

        <button
          type="button"
          onClick={onAnalyze}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-dark)] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(16,47,21,0.16)]"
        >
          Analyze feelings
          <Brain size={16} />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,248,0.82))] p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[1.1rem] font-semibold text-[var(--color-dark)]">
            {emotionTitle}
          </p>
          <span className="rounded-full bg-[var(--color-accent)]/55 px-3 py-1 text-xs font-medium capitalize text-[var(--color-primary-deep)]">
            {emotionState}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          {emotionBody}
        </p>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Keywords detected
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {emotionKeywords.length > 0 ? (
              emotionKeywords.map((keyword) => (
                <motion.span
                  key={keyword}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full border border-white/55 bg-white/82 px-3 py-1.5 text-xs text-[var(--color-dark)] shadow-[0_8px_20px_rgba(53,85,63,0.04)]"
                >
                  {keyword}
                </motion.span>
              ))
            ) : (
              <span className="rounded-full border border-white/55 bg-white/82 px-3 py-1.5 text-xs text-[var(--color-text-secondary)]">
                No strong keywords yet
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
