import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function EmotionsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  redirect("/planner");
}
