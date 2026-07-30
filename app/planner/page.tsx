import { redirect } from "next/navigation";

import PlannerWorkspace from "@/components/app/planner/PlannerWorkspace";
import Navbar from "@/components/layout/Navbar";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getDashboardState } from "@/lib/dashboard/state-store";

export default async function PlannerPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.onboardingCompleted || !user.survey) {
    redirect("/onboarding");
  }

  const dashboardState = await getDashboardState(user.id);

  return (
    <>
      <div className="relative z-50">
        <Navbar />
      </div>
      <PlannerWorkspace
        userId={user.id}
        survey={user.survey}
        studyProfile={user.studyProfile}
        initialTasks={dashboardState?.tasks ?? []}
        initialPlan={dashboardState?.planning?.activePlan ?? null}
      />
    </>
  );
}
