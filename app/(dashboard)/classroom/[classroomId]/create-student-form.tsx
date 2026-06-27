"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createStudentAccountAction, type CreateStudentState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: CreateStudentState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function CreateStudentForm({ classroomId }: { classroomId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const action = createStudentAccountAction.bind(null, classroomId);
  const [state, formAction, pending] = useActionState(async (prev: CreateStudentState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.created) {
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  }, initialState);

  return (
    <div>
      <form ref={formRef} action={formAction} className="grid gap-2 sm:grid-cols-3">
        <input name="displayName" placeholder="Tên học sinh" className={inputClass} required />
        <input name="username" placeholder="Tên đăng nhập" className={inputClass} required />
        <Button type="submit" disabled={pending} variant="glass">
          {pending ? "Đang tạo..." : "Tạo tài khoản"}
        </Button>
      </form>
      {state.error && <p className="mt-2 text-xs text-red-500">{state.error}</p>}
      {state.created && (
        <div className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-500">
          Đã tạo tài khoản <strong>{state.created.username}</strong> với mật khẩu{" "}
          <strong className="font-mono">{state.created.password}</strong>. Hãy lưu lại — mật khẩu này chỉ hiện một lần.
        </div>
      )}
    </div>
  );
}
