import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function PlannerPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Planner"
      title="Auto planning without overwhelm."
      description="This page will organize structure for the day, choose what matters first, and keep manual planning pressure low."
    />
  );
}
