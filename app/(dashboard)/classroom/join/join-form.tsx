"use client";

import { useActionState } from "react";
import { joinClassroomAction, type JoinClassroomState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";

const initialState: JoinClassroomState = {};

export function JoinClassroomForm() {
  const [state, formAction, pending] = useActionState(joinClassroomAction, initialState);

  return (
    <GlassCard className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Tham gia lớp học</h1>
      <p className="mt-1 text-sm text-muted">Nhập mã lớp do giáo viên cung cấp.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input
          name="joinCode"
          className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-center text-lg font-semibold uppercase tracking-widest outline-none focus:border-primary"
          placeholder="ABC123"
          maxLength={8}
          required
        />

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tham gia..." : "Tham gia"}
        </Button>
      </form>
    </GlassCard>
  );
}
