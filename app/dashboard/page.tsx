import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Dashboard"
      title={`Welcome back, ${user.name.split(" ")[0]}.`}
      description="This is your main Maui home. From here, you'll branch into next task, sessions, emotions, rewards, burnout, and survival mode."
    />
  );
}
