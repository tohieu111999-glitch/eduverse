"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { moderateWithdrawalAction } from "./actions";
import { Button } from "@/src/components/ui/button";

export function WithdrawalModerationActions({ withdrawalId }: { withdrawalId: string }) {
  const [pending, setPending] = useState<"COMPLETED" | "REJECTED" | null>(null);

  async function decide(decision: "COMPLETED" | "REJECTED") {
    setPending(decision);
    const result = await moderateWithdrawalAction(withdrawalId, decision);
    setPending(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(decision === "COMPLETED" ? "Đã xác nhận chuyển khoản" : "Đã từ chối, hoàn coin cho người dùng");
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="glass"
        disabled={pending !== null}
        onClick={() => decide("REJECTED")}
        className="text-red-500"
      >
        {pending === "REJECTED" ? "..." : "Từ chối"}
      </Button>
      <Button disabled={pending !== null} onClick={() => decide("COMPLETED")}>
        {pending === "COMPLETED" ? "..." : "Đã chuyển khoản"}
      </Button>
    </div>
  );
}
