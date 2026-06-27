"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { generateQuestionsFromFileAction, type GenerateQuestionsState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: GenerateQuestionsState = {};

export function GenerateQuestionsForm({ quizId }: { quizId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const action = generateQuestionsFromFileAction.bind(null, quizId);
  const [state, formAction, pending] = useActionState(async (prev: GenerateQuestionsState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.count) {
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input
        name="file"
        type="file"
        accept=".txt,.pdf"
        required
        className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />

      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
      {Boolean(state.count) && <p className="text-xs text-emerald-500">Đã thêm {state.count} câu hỏi từ AI!</p>}

      <Button type="submit" disabled={pending} variant="glass" className="w-full">
        <Sparkles className="h-4 w-4" />
        {pending ? "AI đang soạn câu hỏi..." : "Tạo câu hỏi bằng AI"}
      </Button>
    </form>
  );
}
