import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Settings"
      title="Shape Maui around you."
      description="This page will hold account settings, preferences, and the personal tuning that makes the product feel supportive instead of generic."
    />
  );
}
