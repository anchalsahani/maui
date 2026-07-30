"use client";

import { Brain, Clock3, Target } from "lucide-react";
import { useEffect, useState } from "react";

import type {
  PersistedDashboardState,
  PlanningSystemState,
} from "@/components/app/dashboard/types";
import { subscribeToPlanningUpdates } from "@/lib/planning/client-sync";

export default function PlanningProgressCard({
  initialPlanning,
}: {
  initialPlanning: PlanningSystemState | null;
}) {
  const [planning, setPlanning] = useState(initialPlanning);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch("/api/dashboard/state", {
          headers: { Accept: "application/json" },
        });
        const data = (await response.json()) as {
          state?: Partial<PersistedDashboardState> | null;
        };

        if (!cancelled && response.ok) {
          setPlanning(data.state?.planning ?? null);
        }
      } catch {
        // Keep the last known progress read while the connection is unavailable.
      }
    }

    const unsubscribe = subscribeToPlanningUpdates(() => {
      void refresh();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  if (!planning?.activePlan) {
    return null;
  }

  const completedBlocks = Object.values(planning.blockStatus).filter(
    (status) => status === "completed"
  ).length;
  const totalBlocks = planning.activePlan.schedule.length;

  return (
    <section className="app-card mt-5 grid gap-4 rounded-[24px] p-4 sm:mt-8 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:rounded-[32px] sm:p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--color-accent)]/48 text-[var(--color-primary-deep)]">
        <Brain size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--color-primary-deep)]">
          Today&apos;s shared plan
        </p>
        <h2 className="mt-2 truncate text-xl font-semibold">{planning.study.currentGoal ?? planning.activePlan.todayFocus}</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
          {planning.study.completedMinutes} of {planning.study.plannedMinutes} planned focus minutes completed · {completedBlocks}/{totalBlocks} blocks finished
        </p>
      </div>
      <div className="flex gap-2 sm:flex-col sm:items-end">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)]/48 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]">
          <Clock3 size={13} /> {planning.study.plannedMinutes}m planned
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
          <Target size={13} /> {planning.context.energyLevel} energy
        </span>
      </div>
    </section>
  );
}
