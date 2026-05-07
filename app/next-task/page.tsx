import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function NextTaskPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Next Task"
      title="Your one clear next step."
      description="This page will surface the single task Maui wants you to start right now, with instant breakdown and low-friction momentum."
    />
  );
}
