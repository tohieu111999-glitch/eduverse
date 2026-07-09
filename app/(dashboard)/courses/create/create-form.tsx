"use client";

import { useActionState } from "react";
import { createCourseAction, type CreateCourseState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/src/lib/courses";

const initialState: CreateCourseState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function CreateCourseForm() {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);

  return (
    <GlassCard className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-semibold">Tạo khoá học</h1>
      <p className="mt-1 text-sm text-muted">Sau khi tạo, bạn sẽ thêm chương/bài học, gửi duyệt rồi mới mở bán.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tên khoá học</label>
          <input name="title" className={inputClass} placeholder="Ví dụ: Tiếng Anh giao tiếp từ A-Z" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mô tả</label>
          <textarea name="description" rows={4} className={inputClass} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Giá (coin)</label>
            <input name="price" type="number" min={0} max={100000} defaultValue={0} className={inputClass} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Danh mục</label>
            <select name="category" className={inputClass} required defaultValue="">
              <option value="" disabled>
                Chọn danh mục
              </option>
              {COURSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Trình độ</label>
            <select name="level" className={inputClass} required defaultValue={COURSE_LEVELS[0]}>
              {COURSE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ảnh bìa (tuỳ chọn)</label>
          <input name="cover" type="file" accept="image/*" className={inputClass} />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tạo..." : "Tạo khoá học"}
        </Button>
      </form>
    </GlassCard>
  );
}
