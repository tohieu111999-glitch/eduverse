"use client";

import { MessageCircle } from "lucide-react";
import { startConversationAction } from "@/app/(dashboard)/messages/actions";
import { Button } from "@/src/components/ui/button";

export function MessageButton({ targetUserId }: { targetUserId: string }) {
  return (
    <Button variant="glass" onClick={() => startConversationAction(targetUserId)}>
      <MessageCircle className="h-4 w-4" />
      Nhắn tin
    </Button>
  );
}
