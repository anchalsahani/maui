"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { useFocusTimer } from "./useFocusTimer";

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
  const snapshot = useFocusTimer();
  const autoCompletedRunId = useRef<number | null>(null);
  const previousStatus = useRef(snapshot.status);

  useEffect(() => {
    const completedAfterActive =
      previousStatus.current === "active" && snapshot.status === "completed";
    const endedNaturally =
      snapshot.endsAt !== null && Date.now() >= snapshot.endsAt;

    if (
      onAutoComplete &&
      completedAfterActive &&
      endedNaturally &&
      autoCompletedRunId.current !== snapshot.runId &&
      snapshot.focusMinutes > 0
    ) {
      autoCompletedRunId.current = snapshot.runId;
      onAutoComplete();
    }

    previousStatus.current = snapshot.status;
  }, [
    onAutoComplete,
    snapshot.endsAt,
    snapshot.focusMinutes,
    snapshot.runId,
    snapshot.status,
  ]);

  if (compact) {
    return (
      <div>
        <p className="text-[2.2rem] font-semibold tracking-[-0.06em] text-[var(--color-dark)]">
          {formatTime(snapshot.remainingSeconds)}
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
    snapshot.totalSeconds > 0
      ? Math.min(snapshot.elapsedSeconds / snapshot.totalSeconds, 1)
      : 0;

  return (
    <div className="app-subcard rounded-[28px] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
        Pomodoro
      </p>
      <div className="mt-4 rounded-[24px] bg-[var(--color-card-hover)] px-5 py-5 text-center shadow-[0_12px_34px_rgba(53,85,63,0.06)]">
        <motion.p
          key={snapshot.remainingSeconds}
          initial={{ opacity: 0.65, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="text-[3rem] font-semibold tracking-[-0.08em] text-[var(--color-dark)]"
        >
          {formatTime(snapshot.remainingSeconds)}
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
