import { redirect } from "next/navigation";

import PlaceholderWorkspace from "@/components/app/PlaceholderWorkspace";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function EmotionsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PlaceholderWorkspace
      badge="Emotion Check-In"
      title="Let Maui adapt to how you feel."
      description="This page will turn a rant or check-in into emotional context so tasks and sessions can respond more gently."
    />
  );
}
