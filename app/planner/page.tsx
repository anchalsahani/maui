import { redirect } from "next/navigation";

import PlannerWorkspace from "@/components/app/planner/PlannerWorkspace";
import Navbar from "@/components/layout/Navbar";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function PlannerPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.onboardingCompleted || !user.survey) {
    redirect("/personalization");
  }

  return (
    <>
      <div className="relative z-50">
        <Navbar />
      </div>
      <PlannerWorkspace
        userId={user.id}
        survey={user.survey}
        studyProfile={user.studyProfile}
      />
    </>
  );
}
