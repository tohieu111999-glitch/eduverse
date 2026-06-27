"use client";

import { useActionState } from "react";
import { createClassroomAction, type CreateClassroomState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";

const initialState: CreateClassroomState = {};

export function CreateClassroomForm() {
  const [state, formAction, pending] = useActionState(createClassroomAction, initialState);

  return (
    <GlassCard className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Tạo lớp học</h1>
      <p className="mt-1 text-sm text-muted">Lớp học độc lập do bạn quản lý, không thuộc trường nào.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tên lớp</label>
          <input
            name="name"
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Ví dụ: Lớp IELTS tối 7"
            required
          />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tạo..." : "Tạo lớp"}
        </Button>
      </form>
    </GlassCard>
  );
}
