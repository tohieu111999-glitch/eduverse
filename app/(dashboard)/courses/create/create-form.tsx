"use client";

import { useActionState } from "react";
import { createCourseAction, type CreateCourseState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/src/lib/courses";

const SUBJECTS = ["Toán học", "Vật lý", "Hóa học", "Sinh học", "Ngữ văn", "Lịch sử", "Địa lý", "Tiếng Anh", "Tiếng Trung", "Tiếng Nhật", "Tiếng Hàn", "Lập trình", "Kinh tế", "Khác"];

const initialState: CreateCourseState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function CreateCourseForm() {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);

  return (
    <GlassCard className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-semibold">Tạo khoá học</h1>
      <p className="mt-1 text-sm text-muted">Sau khi tạo, bạn thêm chương/bài học, gửi duyệt rồi mới mở bán. Người học thanh toán chuyển khoản ngân hàng trực tiếp cho bạn.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tên khoá học</label>
          <input name="title" className={inputClass} placeholder="Ví dụ: Tiếng Anh giao tiếp từ A-Z" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mô tả</label>
          <textarea name="description" rows={4} className={inputClass} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Môn học</label>
            <select name="subject" className={inputClass} defaultValue="">
              <option value="">-- Không chọn --</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Danh mục</label>
            <select name="category" className={inputClass} required defaultValue="">
              <option value="" disabled>Chọn danh mục</option>
              {COURSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Giá (VND) · <span className="text-muted font-normal">0 = miễn phí</span>
            </label>
            <input name="price" type="number" min={0} max={100000000} step={1000} defaultValue={0} className={inputClass} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Trình độ</label>
            <select name="level" className={inputClass} required defaultValue={COURSE_LEVELS[0]}>
              {COURSE_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ảnh bìa (tuỳ chọn)</label>
          <input name="cover" type="file" accept="image/*" className={inputClass} />
        </div>

        {state.error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tạo..." : "Tạo khoá học"}
        </Button>
      </form>
    </GlassCard>
  );
}
