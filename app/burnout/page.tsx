import { redirect } from "next/navigation";

import BurnoutWorkspace from "@/components/app/burnout/BurnoutWorkspace";
import Navbar from "@/components/layout/Navbar";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function BurnoutPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <div className="relative z-50">
        <Navbar />
      </div>
      <BurnoutWorkspace survey={user.survey} />
    </>
  );
}
