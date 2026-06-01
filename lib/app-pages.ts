export const appPages = [
  { href: "/dashboard", label: "Dashboard", description: "Your main home view" },
  { href: "/personalization", label: "Personalization", description: "Study profile and syllabus" },
  { href: "/planner", label: "Planner", description: "Auto planning and structure" },
  { href: "/focus-session", label: "Sessions", description: "Focus blocks and active work" },
  { href: "/emotions", label: "Check-In", description: "Mood, emotions, and support" },
] as const;

export type AppPage = (typeof appPages)[number];
