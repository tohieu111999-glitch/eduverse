"use client";

import { Phone, Video } from "lucide-react";
import { useCall } from "@/src/components/realtime/call-provider";

export function CallButtons({
  peerId,
  peerName,
  conversationId,
}: {
  peerId: string;
  peerName: string;
  conversationId: string;
}) {
  const { startCall, activeCall } = useCall();
  const disabled = Boolean(activeCall);

  return (
    <div className="ml-auto flex items-center gap-1">
      <button
        onClick={() => startCall(peerId, peerName, conversationId, "audio")}
        disabled={disabled}
        className="rounded-full p-2 text-muted transition hover:bg-foreground/5 disabled:opacity-50"
        aria-label="Gọi điện"
      >
        <Phone className="h-4 w-4" />
      </button>
      <button
        onClick={() => startCall(peerId, peerName, conversationId, "video")}
        disabled={disabled}
        className="rounded-full p-2 text-muted transition hover:bg-foreground/5 disabled:opacity-50"
        aria-label="Gọi video"
      >
        <Video className="h-4 w-4" />
      </button>
    </div>
  );
}
