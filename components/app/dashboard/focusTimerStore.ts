import type { SessionStatus } from "./types";

interface FocusTimerSnapshot {
  status: SessionStatus;
  title: string;
  focusMinutes: number;
  elapsedSeconds: number;
  runId: number;
}

const idleSnapshot: FocusTimerSnapshot = {
  status: "idle",
  title: "",
  focusMinutes: 20,
  elapsedSeconds: 0,
  runId: 0,
};

let snapshot: FocusTimerSnapshot = idleSnapshot;
let intervalId: number | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function stopInterval() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function ensureInterval() {
  if (typeof window === "undefined" || intervalId !== null || snapshot.status !== "active") {
    return;
  }

  intervalId = window.setInterval(() => {
    snapshot = {
      ...snapshot,
      elapsedSeconds: snapshot.elapsedSeconds + 1,
    };
    emit();
  }, 1000);
}

export function subscribeFocusTimer(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getFocusTimerSnapshot() {
  return snapshot;
}

export function getFocusTimerServerSnapshot() {
  return idleSnapshot;
}

export function startFocusTimer(title: string, focusMinutes: number, runId: number) {
  stopInterval();
  snapshot = {
    status: "active",
    title,
    focusMinutes,
    elapsedSeconds: 0,
    runId,
  };
  emit();
  ensureInterval();
}

export function pauseFocusTimer() {
  if (snapshot.status !== "active") {
    return;
  }

  stopInterval();
  snapshot = {
    ...snapshot,
    status: "paused",
  };
  emit();
}

export function resumeFocusTimer() {
  if (snapshot.status !== "paused") {
    return;
  }

  snapshot = {
    ...snapshot,
    status: "active",
  };
  emit();
  ensureInterval();
}

export function completeFocusTimer() {
  stopInterval();
  snapshot = {
    ...snapshot,
    status: "completed",
  };
  emit();
}

export function resetFocusTimer(focusMinutes = 20, runId = snapshot.runId + 1) {
  stopInterval();
  snapshot = {
    status: "idle",
    title: "",
    focusMinutes,
    elapsedSeconds: 0,
    runId,
  };
  emit();
}
