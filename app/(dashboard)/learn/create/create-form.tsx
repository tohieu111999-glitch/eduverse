"use client";

import { useActionState } from "react";
import { createDeckAction, type CreateDeckState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";

const initialState: CreateDeckState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

const LANGUAGES = [
  { value: "zh-CN", label: "🇨🇳 Tiếng Trung (Giản thể)" },
  { value: "zh-TW", label: "🇹🇼 Tiếng Trung (Phồn thể)" },
  { value: "en-US", label: "🇬🇧 Tiếng Anh" },
  { value: "ja-JP", label: "🇯🇵 Tiếng Nhật" },
  { value: "ko-KR", label: "🇰🇷 Tiếng Hàn" },
  { value: "fr-FR", label: "🇫🇷 Tiếng Pháp" },
  { value: "vi-VN", label: "🇻🇳 Tiếng Việt" },
  { value: "other", label: "🌐 Ngôn ngữ khác" },
];

export function CreateDeckForm() {
  const [state, formAction, pending] = useActionState(createDeckAction, initialState);

  return (
    <GlassCard className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Tạo bộ thẻ ghi nhớ</h1>
      <p className="mt-1 text-sm text-muted">Tạo bộ flashcard để học và ôn tập bằng lặp lại ngắt quãng.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Ngôn ngữ</label>
          <select name="language" className={inputClass} defaultValue="zh-CN">
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Tên bộ thẻ</label>
          <input name="name" className={inputClass} placeholder="Ví dụ: Từ vựng tiếng Anh - Unit 1" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mô tả (tuỳ chọn)</label>
          <textarea name="description" rows={2} className={inputClass} />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tạo..." : "Tạo bộ thẻ"}
        </Button>
      </form>
    </GlassCard>
  );
}
