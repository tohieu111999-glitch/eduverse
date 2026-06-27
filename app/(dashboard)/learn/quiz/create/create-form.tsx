"use client";

import { useActionState } from "react";
import { createQuizAction, type CreateQuizState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";
import { QUIZ_LANGUAGES, QUIZ_VISIBILITIES } from "@/src/lib/quiz";

const initialState: CreateQuizState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function CreateQuizForm() {
  const [state, formAction, pending] = useActionState(createQuizAction, initialState);

  return (
    <GlassCard className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Tạo mini quiz</h1>
      <p className="mt-1 text-sm text-muted">Tạo bài quiz với trắc nghiệm, điền từ, nghe và nói.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tên quiz</label>
          <input name="title" className={inputClass} placeholder="Ví dụ: Tiếng Anh giao tiếp - Bài 1" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mô tả (tuỳ chọn)</label>
          <textarea name="description" rows={2} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ngôn ngữ (cho nghe/nói)</label>
          <select name="language" className={inputClass} defaultValue="vi-VN">
            {QUIZ_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Chế độ hiển thị</label>
          <select name="visibility" className={inputClass} defaultValue="PUBLIC">
            {QUIZ_VISIBILITIES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label} — {v.description}
              </option>
            ))}
          </select>
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tạo..." : "Tạo quiz"}
        </Button>
      </form>
    </GlassCard>
  );
}
