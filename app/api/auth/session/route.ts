import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
