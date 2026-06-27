"use client";

import { useActionState, useRef, useState } from "react";
import { addQuestionAction, type AddQuestionState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: AddQuestionState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  FILL_BLANK: "Điền từ",
  LISTENING: "Nghe hiểu",
  SPEAKING: "Nói",
};

export function AddQuestionForm({ quizId }: { quizId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState("MULTIPLE_CHOICE");
  const action = addQuestionAction.bind(null, quizId);
  const [state, formAction, pending] = useActionState(async (prev: AddQuestionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (!result.error) {
      formRef.current?.reset();
      setType("MULTIPLE_CHOICE");
    }
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          name="answer"
          placeholder={
            type === "MULTIPLE_CHOICE"
              ? "Đáp án đúng (khớp 1 lựa chọn)"
              : type === "SPEAKING"
                ? "Cụm từ cần nói (cũng là câu hỏi)"
                : "Đáp án đúng"
          }
          className={inputClass}
          required
        />
      </div>

      <textarea
        name="prompt"
        rows={2}
        placeholder={
          type === "LISTENING"
            ? "Câu/từ sẽ được đọc to cho người học nghe"
            : type === "SPEAKING"
              ? "Câu/từ hiển thị để người học đọc to"
              : type === "FILL_BLANK"
                ? "Câu có chỗ trống, dùng ___ để đánh dấu"
                : "Nội dung câu hỏi"
        }
        className={inputClass}
        required
      />

      {type === "MULTIPLE_CHOICE" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="option1" placeholder="Lựa chọn 1" className={inputClass} />
          <input name="option2" placeholder="Lựa chọn 2" className={inputClass} />
          <input name="option3" placeholder="Lựa chọn 3 (tuỳ chọn)" className={inputClass} />
          <input name="option4" placeholder="Lựa chọn 4 (tuỳ chọn)" className={inputClass} />
        </div>
      )}

      {state.error && <p className="text-xs text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} variant="glass" className="w-full">
        {pending ? "Đang thêm..." : "Thêm câu hỏi"}
      </Button>
    </form>
  );
}
