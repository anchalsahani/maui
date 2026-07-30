import { redirect } from "next/navigation";

import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.onboardingCompleted && user.survey) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizard
      initialSurvey={user.survey}
      initialDraft={user.onboardingDraft ?? null}
      firstName={user.name.split(" ")[0] || "there"}
    />
  );
}
