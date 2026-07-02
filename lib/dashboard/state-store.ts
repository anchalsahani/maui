import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { PersistedDashboardState } from "@/components/app/dashboard/types";
import { hasKvStore, kvGetJson, kvSetJson } from "@/lib/storage/kv";

const DATA_DIR = path.join(process.cwd(), ".local-data");
const DASHBOARD_STATES_FILE = path.join(DATA_DIR, "dashboard-states.json");
const DASHBOARD_STATES_KEY = "maui:dashboard-states";

interface StoredDashboardState {
  userId: string;
  updatedAt: string;
  state: PersistedDashboardState;
}

async function ensureDashboardStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DASHBOARD_STATES_FILE, "utf8");
  } catch {
    await writeFile(DASHBOARD_STATES_FILE, "[]", "utf8");
  }
}

async function readDashboardStates(): Promise<StoredDashboardState[]> {
  if (hasKvStore()) {
    const states = await kvGetJson<StoredDashboardState[]>(DASHBOARD_STATES_KEY);
    return Array.isArray(states) ? states.filter(isStoredDashboardState) : [];
  }

  await ensureDashboardStore();
  const raw = await readFile(DASHBOARD_STATES_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as StoredDashboardState[];
    return Array.isArray(parsed) ? parsed.filter(isStoredDashboardState) : [];
  } catch {
    return [];
  }
}

async function writeDashboardStates(states: StoredDashboardState[]) {
  if (hasKvStore()) {
    await kvSetJson(DASHBOARD_STATES_KEY, states);
    return;
  }

  await ensureDashboardStore();
  await writeFile(DASHBOARD_STATES_FILE, JSON.stringify(states, null, 2), "utf8");
}

export async function getDashboardState(userId: string) {
  const states = await readDashboardStates();
  return states.find((entry) => entry.userId === userId)?.state ?? null;
}

export async function saveDashboardState(
  userId: string,
  state: PersistedDashboardState
) {
  const states = await readDashboardStates();
  const updatedEntry: StoredDashboardState = {
    userId,
    updatedAt: new Date().toISOString(),
    state,
  };
  const nextStates = [
    updatedEntry,
    ...states.filter((entry) => entry.userId !== userId),
  ];

  await writeDashboardStates(nextStates);
  return updatedEntry.state;
}

export function isPersistedDashboardState(
  value: unknown
): value is PersistedDashboardState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PersistedDashboardState>;

  return (
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.recentMoments) &&
    Array.isArray(candidate.completedMicroSteps) &&
    Boolean(candidate.reward) &&
    Boolean(candidate.session)
  );
}

function isStoredDashboardState(value: unknown): value is StoredDashboardState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredDashboardState>;

  return (
    typeof candidate.userId === "string" &&
    typeof candidate.updatedAt === "string" &&
    isPersistedDashboardState(candidate.state)
  );
}
