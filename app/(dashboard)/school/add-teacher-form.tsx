"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addTeacherAction, type AddTeacherState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: AddTeacherState = {};

export function AddTeacherForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: AddTeacherState, formData: FormData) => {
    const result = await addTeacherAction(prev, formData);
    if (!result.error) {
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction}>
      <div className="flex gap-2">
        <input
          name="username"
          placeholder="Tên đăng nhập giáo viên"
          className="flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
          required
        />
        <Button type="submit" disabled={pending} variant="glass">
          {pending ? "Đang thêm..." : "Thêm"}
        </Button>
      </div>
      {state.error && <p className="mt-1 text-xs text-red-500">{state.error}</p>}
    </form>
  );
}
