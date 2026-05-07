export const appPages = [
  { href: "/dashboard", label: "Dashboard", description: "Your main home view" },
  { href: "/next-task", label: "Next Task", description: "One clear task to start" },
  { href: "/focus-session", label: "Focus Session", description: "Start and track focus blocks" },
  { href: "/planner", label: "Planner", description: "Auto planning and structure" },
  { href: "/emotions", label: "Emotion Check-In", description: "Rant, reflect, and adapt workload" },
  { href: "/rewards", label: "Rewards", description: "Progress, streaks, and wins" },
  { href: "/burnout", label: "Burnout", description: "Energy patterns and lighter fallback mode" },
  { href: "/survival-mode", label: "Survival Mode", description: "Gentle low-pressure starting path" },
] as const;

export type AppPage = (typeof appPages)[number];
