import type { SessionStatus } from "./types";

type TimerMode = "study" | "break";

export interface FocusTimerSnapshot {
  status: SessionStatus;
  mode: TimerMode;
  title: string;
  focusMinutes: number;
  totalSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  startedAt: number | null;
  endsAt: number | null;
  pausedAt: number | null;
  accumulatedPausedMs: number;
  runId: number;
}

const STORAGE_KEY = "maui-focus-timer-v2";

const idleSnapshot: FocusTimerSnapshot = {
  status: "idle",
  mode: "study",
  title: "",
  focusMinutes: 20,
  totalSeconds: 20 * 60,
  elapsedSeconds: 0,
  remainingSeconds: 20 * 60,
  startedAt: null,
  endsAt: null,
  pausedAt: null,
  accumulatedPausedMs: 0,
  runId: 0,
};

let snapshot: FocusTimerSnapshot = idleSnapshot;
let intervalId: number | null = null;
let lastRenderedSecond = -1;
const listeners = new Set<() => void>();

function getNow() {
  return Date.now();
}

function emit() {
  listeners.forEach((listener) => listener());
}

function stopInterval() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function persist() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function normalize(nextSnapshot: FocusTimerSnapshot, now = getNow()): FocusTimerSnapshot {
  if (nextSnapshot.status !== "active" || !nextSnapshot.endsAt) {
    return nextSnapshot;
  }

  const remainingSeconds = Math.max(
    0,
    Math.ceil((nextSnapshot.endsAt - now) / 1000)
  );
  const elapsedSeconds = Math.min(
    nextSnapshot.totalSeconds,
    nextSnapshot.totalSeconds - remainingSeconds
  );

  return {
    ...nextSnapshot,
    status: remainingSeconds === 0 ? "completed" : nextSnapshot.status,
    elapsedSeconds,
    remainingSeconds,
  };
}

function setSnapshot(nextSnapshot: FocusTimerSnapshot, shouldPersist = true) {
  snapshot = normalize(nextSnapshot);
  lastRenderedSecond = snapshot.remainingSeconds;

  if (shouldPersist) {
    persist();
  }

  emit();

  if (snapshot.status === "active") {
    ensureInterval();
  } else {
    stopInterval();
  }
}

function tick() {
  const normalized = normalize(snapshot);

  if (normalized.remainingSeconds === lastRenderedSecond && normalized.status === snapshot.status) {
    return;
  }

  snapshot = normalized;
  lastRenderedSecond = normalized.remainingSeconds;
  persist();
  emit();

  if (normalized.status !== "active") {
    stopInterval();
  }
}

function ensureInterval() {
  if (typeof window === "undefined" || intervalId !== null || snapshot.status !== "active") {
    return;
  }

  intervalId = window.setInterval(tick, 250);
}

function hydrate() {
  if (typeof window === "undefined") {
    return;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as FocusTimerSnapshot;
    snapshot = normalize({
      ...idleSnapshot,
      ...parsed,
      totalSeconds: parsed.totalSeconds || parsed.focusMinutes * 60,
      remainingSeconds: parsed.remainingSeconds ?? parsed.focusMinutes * 60,
      elapsedSeconds: parsed.elapsedSeconds ?? 0,
    });
    lastRenderedSecond = snapshot.remainingSeconds;
    emit();
    ensureInterval();
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function installBrowserListeners() {
  if (typeof window === "undefined" || window.__mauiTimerListenersInstalled) {
    return;
  }

  window.__mauiTimerListenersInstalled = true;
  window.addEventListener("visibilitychange", tick);
  window.addEventListener("focus", tick);
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      hydrate();
    }
  });
}

export function subscribeFocusTimer(listener: () => void) {
  listeners.add(listener);
  hydrate();
  installBrowserListeners();
  ensureInterval();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && snapshot.status !== "active") {
      stopInterval();
    }
  };
}

export function getFocusTimerSnapshot() {
  return snapshot;
}

export function getFocusTimerServerSnapshot() {
  return idleSnapshot;
}

export function startFocusTimer(
  title: string,
  focusMinutes: number,
  runId: number,
  mode: TimerMode = "study"
) {
  const totalSeconds = Math.max(60, Math.round(focusMinutes * 60));
  const now = getNow();

  setSnapshot({
    status: "active",
    mode,
    title,
    focusMinutes,
    totalSeconds,
    elapsedSeconds: 0,
    remainingSeconds: totalSeconds,
    startedAt: now,
    endsAt: now + totalSeconds * 1000,
    pausedAt: null,
    accumulatedPausedMs: 0,
    runId,
  });
}

export function pauseFocusTimer() {
  if (snapshot.status !== "active") {
    return;
  }

  setSnapshot({
    ...normalize(snapshot),
    status: "paused",
    pausedAt: getNow(),
  });
}

export function resumeFocusTimer() {
  if (snapshot.status !== "paused" || !snapshot.pausedAt || !snapshot.endsAt) {
    return;
  }

  const now = getNow();
  const pausedDuration = now - snapshot.pausedAt;

  setSnapshot({
    ...snapshot,
    status: "active",
    pausedAt: null,
    endsAt: snapshot.endsAt + pausedDuration,
    accumulatedPausedMs: snapshot.accumulatedPausedMs + pausedDuration,
  });
}

export function completeFocusTimer() {
  setSnapshot({
    ...snapshot,
    status: "completed",
    elapsedSeconds: snapshot.totalSeconds,
    remainingSeconds: 0,
  });
}

export function resetFocusTimer(focusMinutes = 20, runId = snapshot.runId + 1) {
  const totalSeconds = Math.max(60, Math.round(focusMinutes * 60));

  setSnapshot({
    ...idleSnapshot,
    focusMinutes,
    totalSeconds,
    remainingSeconds: totalSeconds,
    runId,
  });
}

declare global {
  interface Window {
    __mauiTimerListenersInstalled?: boolean;
  }
}
