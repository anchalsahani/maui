export const workspaceNavigationGroups = [
  {
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        description: "Your tasks and current focus",
      },
      {
        href: "/planner",
        label: "AI Planner",
        description: "Build a capacity-aware plan",
      },
      {
        href: "/next-task",
        label: "Task Breakdown",
        description: "Turn any task into tiny actions",
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        href: "/burnout",
        label: "Burnout Check-In",
        description: "Understand overload and lower pressure",
      },
      {
        href: "/survival-mode",
        label: "Survival Mode",
        description: "Keep only the essential next steps",
      },
    ],
  },
  {
    label: "Progress",
    items: [
      {
        href: "/rewards",
        label: "Progress",
        description: "Consistency, streaks, and milestones",
      },
    ],
  },
] as const;

export type WorkspaceNavigationGroup =
  (typeof workspaceNavigationGroups)[number];
