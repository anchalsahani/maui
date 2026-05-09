import { redirect } from "next/navigation";

import MauiDashboard from "@/components/app/MauiDashboard";
import Navbar from "@/components/layout/Navbar";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.onboardingCompleted || !user.survey) {
    redirect("/onboarding");
  }

  return (
    <>
      <div className="relative z-50">
        <Navbar />
      </div>
      <MauiDashboard userName={user.name} survey={user.survey} />
    </>
  );
}
