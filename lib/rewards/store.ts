import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".local-data");
const REWARD_EVENTS_FILE = path.join(DATA_DIR, "reward-events.json");

export type RewardEventType = "focus_session" | "micro_step" | "broken_down_task";

export interface RewardEvent {
  id: string;
  userId: string;
  type: RewardEventType;
  points: number;
  title: string;
  createdAt: string;
}

async function ensureRewardStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(REWARD_EVENTS_FILE, "utf8");
  } catch {
    await writeFile(REWARD_EVENTS_FILE, "[]", "utf8");
  }
}

async function readRewardEvents(): Promise<RewardEvent[]> {
  await ensureRewardStore();
  const raw = await readFile(REWARD_EVENTS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as RewardEvent[];
    return Array.isArray(parsed) ? parsed.filter(isRewardEvent) : [];
  } catch {
    return [];
  }
}

async function writeRewardEvents(events: RewardEvent[]) {
  await ensureRewardStore();
  await writeFile(REWARD_EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
}

export async function listRewardEvents(userId: string) {
  const events = await readRewardEvents();

  return events
    .filter((event) => event.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createRewardEvent({
  userId,
  type,
  points,
  title,
}: {
  userId: string;
  type: RewardEventType;
  points: number;
  title: string;
}) {
  const events = await readRewardEvents();
  const event: RewardEvent = {
    id: randomUUID(),
    userId,
    type,
    points,
    title,
    createdAt: new Date().toISOString(),
  };

  await writeRewardEvents([event, ...events]);
  return event;
}

export function getRewardSummary(events: RewardEvent[]) {
  const totalPoints = events.reduce((total, event) => total + event.points, 0);
  const sessionsCompleted = events.filter(
    (event) => event.type === "focus_session"
  ).length;
  const microTasksCompleted = events.filter(
    (event) => event.type === "micro_step"
  ).length;
  const streak = getDailyStreak(events);

  return {
    totalPoints,
    sessionsCompleted,
    microTasksCompleted,
    streak,
  };
}

function getDailyStreak(events: RewardEvent[]) {
  const days = new Set(
    events.map((event) => new Date(event.createdAt).toISOString().slice(0, 10))
  );
  let streak = 0;
  const cursor = new Date();

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function isRewardEvent(value: unknown): value is RewardEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RewardEvent>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.userId === "string" &&
    isRewardEventType(candidate.type) &&
    typeof candidate.points === "number" &&
    typeof candidate.title === "string" &&
    typeof candidate.createdAt === "string"
  );
}

export function isRewardEventType(value: unknown): value is RewardEventType {
  return (
    value === "focus_session" ||
    value === "micro_step" ||
    value === "broken_down_task"
  );
}
