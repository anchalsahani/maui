import type { GeneratedStudyTask } from "@/lib/auth/types";

export function groupTasksByCategory(tasks: GeneratedStudyTask[]) {
  return tasks.reduce((acc, task) => {
    const category = task.category || "Uncategorized";

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(task);

    return acc;
  }, {} as Record<string, GeneratedStudyTask[]>);
}
