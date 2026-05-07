import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function BurnoutPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Burnout"
      title="Notice energy drop before it spirals."
      description="This page will surface burnout signals, workload reduction, and adaptive suggestions when momentum starts breaking down."
    />
  );
}
