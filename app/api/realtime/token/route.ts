import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { signRealtimeToken } from "@/src/lib/realtime-token";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ token: signRealtimeToken(session.user.id) });
}
