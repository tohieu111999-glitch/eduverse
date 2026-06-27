"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSchoolClassroomAction, type CreateClassroomState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: CreateClassroomState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function CreateClassroomForm({ teachers }: { teachers: { id: string; name: string }[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: CreateClassroomState, formData: FormData) => {
    const result = await createSchoolClassroomAction(prev, formData);
    if (!result.error) {
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  }, initialState);

  if (teachers.length === 0) {
    return <p className="text-xs text-muted">Thêm giáo viên vào trường trước khi tạo lớp.</p>;
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="name" placeholder="Tên lớp (ví dụ: Lớp 10A1)" className={inputClass} required />
        <select name="teacherId" className={inputClass} required defaultValue="">
          <option value="" disabled>
            Chọn giáo viên dạy
          </option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
      <Button type="submit" disabled={pending} variant="glass" className="w-full">
        {pending ? "Đang tạo..." : "Tạo lớp"}
      </Button>
    </form>
  );
}
