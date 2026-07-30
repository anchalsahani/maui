import { redirect } from "next/navigation";

import SurvivalModeWorkspace from "@/components/app/survival/SurvivalModeWorkspace";
import Navbar from "@/components/layout/Navbar";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getDashboardState } from "@/lib/dashboard/state-store";

export default async function SurvivalModePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getDashboardState(user.id);

  return (
    <>
      <div className="relative z-50">
        <Navbar />
      </div>
      <SurvivalModeWorkspace initialState={state} />
    </>
  );
}
