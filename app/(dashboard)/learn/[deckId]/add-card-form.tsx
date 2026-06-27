"use client";

import { useActionState, useRef } from "react";
import { addCardAction, type AddCardState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: AddCardState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function AddCardForm({ deckId }: { deckId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = addCardAction.bind(null, deckId);
  const [state, formAction, pending] = useActionState(async (prev: AddCardState, formData: FormData) => {
    const result = await action(prev, formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input name="front" placeholder="Mặt trước (câu hỏi/từ)" className={inputClass} required />
      <input name="back" placeholder="Mặt sau (đáp án/nghĩa)" className={inputClass} required />
      {state.error && <p className="text-xs text-red-500 sm:col-span-2">{state.error}</p>}
      <Button type="submit" disabled={pending} variant="glass" className="sm:col-span-2">
        {pending ? "Đang thêm..." : "Thêm thẻ"}
      </Button>
    </form>
  );
}
