import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function RewardsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Rewards"
      title="See streaks, points, and momentum."
      description="This page will show the reward system that reinforces starting behavior, consistency, and small wins."
    />
  );
}
