import { redirect } from "next/navigation";

import TaskBreakdownWorkspace from "@/components/app/breakdown/TaskBreakdownWorkspace";
import Navbar from "@/components/layout/Navbar";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function NextTaskPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <div className="relative z-50">
        <Navbar />
      </div>
      <TaskBreakdownWorkspace />
    </>
  );
}
