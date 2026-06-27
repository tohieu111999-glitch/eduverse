"use client";

import { useActionState, useRef } from "react";
import { createPostAction, type CreatePostState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";

const initialState: CreatePostState = {};

export function PostComposer() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: CreatePostState, formData: FormData) => {
    const result = await createPostAction(prev, formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <GlassCard className="p-4">
      <form ref={formRef} action={formAction} className="space-y-3">
        <textarea
          name="content"
          rows={3}
          maxLength={2000}
          placeholder="Bạn đang học gì hôm nay? Chia sẻ với cộng đồng EduVerse..."
          className="w-full resize-none rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:border-primary"
          required
        />
        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">+10 EXP khi đăng bài</span>
          <Button type="submit" disabled={pending}>
            {pending ? "Đang đăng..." : "Đăng bài"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
