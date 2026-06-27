"use client";

import { useActionState } from "react";
import { createServerAction, type CreateServerState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";

const initialState: CreateServerState = {};

export function CreateServerForm() {
  const [state, formAction, pending] = useActionState(createServerAction, initialState);

  return (
    <GlassCard className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Tạo nhóm mới</h1>
      <p className="mt-1 text-sm text-muted">Tạo nhóm học tập, lớp học hoặc nhóm nghiên cứu của riêng bạn.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tên nhóm</label>
          <input
            name="name"
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Ví dụ: Nhóm học Toán 12A1"
            required
          />
          {state.error && <p className="mt-1 text-xs text-red-500">{state.error}</p>}
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tạo..." : "Tạo nhóm"}
        </Button>
      </form>
    </GlassCard>
  );
}
