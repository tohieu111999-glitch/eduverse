"use server";

import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { getOrCreateDirectConversation } from "@/src/lib/conversations";

export async function startConversationAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.id === targetUserId) return;

  const conversation = await getOrCreateDirectConversation(session.user.id, targetUserId);
  redirect(`/messages/${conversation.id}`);
}
