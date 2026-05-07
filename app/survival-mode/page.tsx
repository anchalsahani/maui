import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function SurvivalModePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Survival Mode"
      title="A softer path for the hard days."
      description="This page will offer the lowest-pressure way to begin: lighter tasks, smaller sessions, and fallback support when everything feels too much."
    />
  );
}
