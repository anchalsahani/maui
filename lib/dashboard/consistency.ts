export interface ConsistencyMetrics {
  currentStreak: number;
  longestStreak: number;
  activeDaysThisWeek: number;
  monthlyActivity: Record<string, boolean>;
  lastActiveDay: string | null;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(day: string, amount: number) {
  const date = new Date(`${day}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDayKey(date);
}

export function getConsistencyMetrics(activityDays: string[], now = new Date()): ConsistencyMetrics {
  const days = [...new Set(activityDays.filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)))].sort();
  const active = new Set(days);
  const today = toDayKey(now);
  const yesterday = addDays(today, -1);
  let currentStreak = 0;
  let cursor = active.has(today) ? today : active.has(yesterday) ? yesterday : null;

  while (cursor && active.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let longestStreak = 0;
  let running = 0;
  let previous: string | null = null;
  for (const day of days) {
    running = previous === addDays(day, -1) ? running + 1 : 1;
    longestStreak = Math.max(longestStreak, running);
    previous = day;
  }

  const weekStart = addDays(today, -6);
  const activeDaysThisWeek = days.filter((day) => day >= weekStart && day <= today).length;
  const monthlyActivity = Object.fromEntries(
    Array.from({ length: 30 }, (_, index) => addDays(today, index - 29)).map((day) => [day, active.has(day)])
  );

  return {
    currentStreak,
    longestStreak,
    activeDaysThisWeek,
    monthlyActivity,
    lastActiveDay: days.at(-1) ?? null,
  };
}

export function recordProductiveDay(activityDays: string[], now = new Date()) {
  const today = toDayKey(now);
  return [...new Set([...activityDays, today])].sort().slice(-90);
}
