import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function FocusSessionPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Focus Session"
      title="Start, pause, and finish sessions."
      description="This page will run Maui's session engine with timer controls, active state, and a calmer experience for actually beginning work."
    />
  );
}
