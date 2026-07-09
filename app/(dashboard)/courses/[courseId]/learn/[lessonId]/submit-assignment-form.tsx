"use client";

import { useActionState } from "react";
import { Button } from "@/src/components/ui/button";
import { submitAssignmentAction } from "./actions";

export function SubmitAssignmentForm({
  courseId,
  lessonId,
  currentContent,
}: {
  courseId: string;
  lessonId: string;
  currentContent?: string;
}) {
  const bound = submitAssignmentAction.bind(null, courseId, lessonId);
  const [state, formAction, pending] = useActionState(bound, {});

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="content"
        defaultValue={currentContent}
        rows={8}
        placeholder="Nhập bài làm của bạn tại đây..."
        className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:border-primary"
        required
      />
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-500">Đã nộp bài thành công!</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Đang nộp..." : currentContent ? "Nộp lại" : "Nộp bài"}
      </Button>
    </form>
  );
}
