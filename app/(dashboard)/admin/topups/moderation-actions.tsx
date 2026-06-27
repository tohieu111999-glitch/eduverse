"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { moderateTopupAction } from "./actions";
import { Button } from "@/src/components/ui/button";

export function TopupModerationActions({ topupId }: { topupId: string }) {
  const [pending, setPending] = useState<"COMPLETED" | "CANCELLED" | null>(null);

  async function decide(decision: "COMPLETED" | "CANCELLED") {
    setPending(decision);
    const result = await moderateTopupAction(topupId, decision);
    setPending(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(decision === "COMPLETED" ? "Đã cộng coins cho người dùng" : "Đã huỷ yêu cầu");
  }

  return (
    <div className="flex gap-2">
      <Button variant="glass" disabled={pending !== null} onClick={() => decide("CANCELLED")} className="text-red-500">
        {pending === "CANCELLED" ? "..." : "Huỷ"}
      </Button>
      <Button disabled={pending !== null} onClick={() => decide("COMPLETED")}>
        {pending === "COMPLETED" ? "..." : "Đã nhận tiền"}
      </Button>
    </div>
  );
}
