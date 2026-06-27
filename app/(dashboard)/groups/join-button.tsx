"use client";

import { joinServerAction } from "./actions";
import { Button } from "@/src/components/ui/button";

export function JoinButton({ serverId }: { serverId: string }) {
  return (
    <Button variant="glass" onClick={() => joinServerAction(serverId)}>
      Tham gia
    </Button>
  );
}
