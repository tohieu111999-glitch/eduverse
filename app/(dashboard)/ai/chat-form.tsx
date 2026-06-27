"use client";

import { useActionState, useRef } from "react";
import { sendMessageAction, type SendMessageState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: SendMessageState = {};

export function ChatForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: SendMessageState, formData: FormData) => {
    const result = await sendMessageAction(prev, formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <div className="border-t border-foreground/10 p-4">
      <form ref={formRef} action={formAction} className="flex gap-2">
        <textarea
          name="content"
          rows={2}
          maxLength={4000}
          placeholder="Hỏi trợ lý AI: giải bài tập, dịch thuật, tóm tắt..."
          className="flex-1 resize-none rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
          required
        />
        <Button type="submit" disabled={pending} className="self-end">
          {pending ? "Đang trả lời..." : "Gửi"}
        </Button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-500">{state.error}</p>}
      {Boolean(state.chargedCoins) && (
        <p className="mt-2 text-xs text-muted">Đã trừ {state.chargedCoins} coin cho câu hỏi này.</p>
      )}
    </div>
  );
}
