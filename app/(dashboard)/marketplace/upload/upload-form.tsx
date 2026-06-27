"use client";

import { useActionState } from "react";
import { uploadDocumentAction, type UploadDocumentState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";
import { DOCUMENT_CATEGORIES } from "@/src/lib/marketplace";

const initialState: UploadDocumentState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export function UploadForm() {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, initialState);

  return (
    <GlassCard className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-semibold">Đăng bán tài liệu</h1>
      <p className="mt-1 text-sm text-muted">
        Tài liệu sẽ được admin kiểm duyệt trước khi hiển thị công khai trên chợ tài liệu.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
          <input name="title" className={inputClass} placeholder="Ví dụ: Tổng hợp đề thi Toán 12" required />
          {state.fieldErrors?.title && <p className="mt-1 text-xs text-red-500">{state.fieldErrors.title}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Mô tả</label>
          <textarea name="description" rows={4} className={inputClass} required />
          {state.fieldErrors?.description && (
            <p className="mt-1 text-xs text-red-500">{state.fieldErrors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Danh mục</label>
            <select name="category" className={inputClass} required defaultValue="">
              <option value="" disabled>
                Chọn danh mục
              </option>
              {DOCUMENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {state.fieldErrors?.category && <p className="mt-1 text-xs text-red-500">{state.fieldErrors.category}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Giá (coins)</label>
            <input name="price" type="number" min={0} max={100000} className={inputClass} defaultValue={0} required />
            {state.fieldErrors?.price && <p className="mt-1 text-xs text-red-500">{state.fieldErrors.price}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Tệp tài liệu (PDF, Word, Excel, PowerPoint, ZIP — tối đa 20MB)</label>
          <input
            name="file"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Ảnh bìa (tuỳ chọn, tối đa 4MB)</label>
          <input name="cover" type="file" accept="image/*" className={inputClass} />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tải lên..." : "Đăng bán"}
        </Button>
      </form>
    </GlassCard>
  );
}
