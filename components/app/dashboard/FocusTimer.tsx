"use client";

import { motion } from "framer-motion";
import { useEffect, useSyncExternalStore } from "react";

import {
  getFocusTimerServerSnapshot,
  getFocusTimerSnapshot,
  subscribeFocusTimer,
} from "./focusTimerStore";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function FocusTimer({
  onAutoComplete,
  compact = false,
}: {
  onAutoComplete?: () => void;
  compact?: boolean;
}) {
  const snapshot = useSyncExternalStore(
    subscribeFocusTimer,
    getFocusTimerSnapshot,
    getFocusTimerServerSnapshot
  );

  useEffect(() => {
    if (
      onAutoComplete &&
      snapshot.status === "active" &&
      snapshot.elapsedSeconds >= snapshot.focusMinutes * 60 &&
      snapshot.focusMinutes > 0
    ) {
      onAutoComplete();
    }
  }, [onAutoComplete, snapshot.elapsedSeconds, snapshot.focusMinutes, snapshot.status]);

  if (compact) {
    return (
      <div>
        <p className="text-[2.2rem] font-semibold tracking-[-0.06em] text-[var(--color-dark)]">
          {formatTime(snapshot.elapsedSeconds)}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {snapshot.status === "idle"
            ? "No active session yet. Open Ready, Stuck, or Tired to choose the right mode."
            : `${snapshot.title} is currently ${snapshot.status}.`}
        </p>
      </div>
    );
  }

  const progress =
    snapshot.focusMinutes > 0
      ? Math.min(snapshot.elapsedSeconds / (snapshot.focusMinutes * 60), 1)
      : 0;

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,248,0.82))] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
        Pomodoro
      </p>
      <div className="mt-4 rounded-[24px] bg-white/78 px-5 py-5 text-center shadow-[0_12px_34px_rgba(53,85,63,0.06)]">
        <motion.p
          key={snapshot.elapsedSeconds}
          initial={{ opacity: 0.65, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="text-[3rem] font-semibold tracking-[-0.08em] text-[var(--color-dark)]"
        >
          {formatTime(snapshot.elapsedSeconds)}
        </motion.p>
        <p className="mt-2 text-sm capitalize text-[var(--color-text-secondary)]">
          {snapshot.status === "idle" ? "Ready to start" : snapshot.status}
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-accent)]/30">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-primary-deep))]"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
