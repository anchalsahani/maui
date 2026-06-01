"use client";

import { useSyncExternalStore } from "react";

import {
  getFocusTimerServerSnapshot,
  getFocusTimerSnapshot,
  subscribeFocusTimer,
} from "./focusTimerStore";

export function useFocusTimer() {
  return useSyncExternalStore(
    subscribeFocusTimer,
    getFocusTimerSnapshot,
    getFocusTimerServerSnapshot
  );
}
