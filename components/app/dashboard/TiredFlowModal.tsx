"use client";

import { motion } from "framer-motion";
import { Brain, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { EmotionState } from "./types";
import type { BurnoutRisk } from "@/lib/ai/types";

export default function TiredFlowModal({
  emotionInput,
  emotionState,
  emotionKeywords,
  emotionTitle,
  emotionBody,
  burnoutRisk,
  crisisFlag,
  analysisError,
  isAnalyzing,
  onEmotionChange,
  onAnalyze,
}: {
  emotionInput: string;
  emotionState: EmotionState;
  emotionKeywords: string[];
  emotionTitle: string;
  emotionBody: string;
  burnoutRisk: BurnoutRisk;
  crisisFlag: boolean;
  analysisError: string;
  isAnalyzing: boolean;
  onEmotionChange: (value: string) => void;
  onAnalyze: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState(emotionInput);
  const characterCount = draft.length;

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 360)}px`;
  }, [draft]);

  function handleDraftChange(value: string) {
    setDraft(value);
    onEmotionChange(value);
  }

  return (
    <div className="grid min-h-[440px] gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full flex-col rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,250,247,0.9))] p-4 sm:p-5"
      >
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => handleDraftChange(event.target.value)}
          className="input min-h-[280px] flex-1 resize-none scroll-py-4 touch-manipulation"
          maxLength={1200}
          autoFocus
          autoComplete="off"
          spellCheck
          placeholder="Drop the messy version here. What feels heavy, annoying, blocked, or too loud right now?"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span>Draft autosaves on this dashboard.</span>
          <span>{characterCount}/1200</span>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={draft.trim().length === 0 || isAnalyzing}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-dark)] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(16,47,21,0.16)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isAnalyzing ? "Analyzing" : "Analyze feelings"}
          {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
        </button>
        {analysisError ? (
          <p className="mt-3 rounded-[16px] border border-[var(--color-border)] bg-white/78 px-3 py-2 text-xs leading-5 text-[var(--color-text-secondary)]">
            {analysisError}
          </p>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full flex-col rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,248,0.82))] p-4 sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[1.1rem] font-semibold text-[var(--color-dark)]">
            {emotionTitle}
          </p>
          <span className="rounded-full bg-[var(--color-accent)]/55 px-3 py-1 text-xs font-medium capitalize text-[var(--color-primary-deep)]">
            {emotionState} · {burnoutRisk}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          {emotionBody}
        </p>

        {crisisFlag ? (
          <div className="mt-4 flex gap-3 rounded-[20px] border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-900">
            <ShieldAlert className="mt-0.5 shrink-0" size={18} />
            <p>Pause productivity mode and contact a trusted person or emergency support now.</p>
          </div>
        ) : null}

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
        <div className="mt-auto h-24 rounded-[24px] bg-[linear-gradient(180deg,rgba(207,232,213,0.18),rgba(255,255,255,0.5))]" />
      </motion.div>
    </div>
  );
}
