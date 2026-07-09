"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { moderateCourseAction } from "./actions";
import { Button } from "@/src/components/ui/button";

export function CourseModerationActions({ courseId }: { courseId: string }) {
  const [pending, setPending] = useState<"APPROVED" | "REJECTED" | null>(null);

  async function decide(decision: "APPROVED" | "REJECTED") {
    setPending(decision);
    const result = await moderateCourseAction(courseId, decision);
    setPending(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(decision === "APPROVED" ? "Đã duyệt khoá học" : "Đã từ chối khoá học");
  }

  return (
    <div className="flex gap-2">
      <Button variant="glass" disabled={pending !== null} onClick={() => decide("REJECTED")} className="text-red-500">
        {pending === "REJECTED" ? "..." : "Từ chối"}
      </Button>
      <Button disabled={pending !== null} onClick={() => decide("APPROVED")}>
        {pending === "APPROVED" ? "..." : "Duyệt"}
      </Button>
    </div>
  );
}
