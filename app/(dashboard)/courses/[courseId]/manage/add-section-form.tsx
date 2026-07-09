"use client";

import { useActionState, useRef } from "react";
import { addSectionAction, type SectionState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: SectionState = {};

export function AddSectionForm({ courseId }: { courseId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = addSectionAction.bind(null, courseId);
  const [state, formAction, pending] = useActionState(async (prev: SectionState, fd: FormData) => {
    const result = await action(prev, fd);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction}>
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="Tên chương mới (vd: Chương 1: Nhập môn)"
          className="flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
          required
        />
        <Button type="submit" disabled={pending} variant="glass">
          {pending ? "Đang thêm..." : "Thêm chương"}
        </Button>
      </div>
      {state.error && <p className="mt-1 text-xs text-red-500">{state.error}</p>}
    </form>
  );
}
