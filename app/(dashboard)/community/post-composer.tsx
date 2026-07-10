"use client";

import { useActionState, useRef, useState } from "react";
import { createPostAction, type CreatePostState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";

const initialState: CreatePostState = {};

export function CommunityComposer({ avatar, name }: { avatar?: string | null; name: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [expanded, setExpanded] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  const [state, formAction, pending] = useActionState(async (prev: CreatePostState, formData: FormData) => {
    const result = await createPostAction(prev, formData);
    if (!result.error) {
      formRef.current?.reset();
      setExpanded(false);
    }
    return result;
  }, initialState);

  return (
    <GlassCard className="p-4">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full gradient-cyber text-sm font-semibold text-white">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>

        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-left text-sm text-muted/70 transition hover:bg-foreground/8 hover:text-muted"
          >
            Bạn đang thắc mắc điều gì?
          </button>
        ) : (
          <form ref={formRef} action={formAction} className="flex-1 space-y-3">
            <input
              name="title"
              type="text"
              maxLength={120}
              placeholder="Tiêu đề (tuỳ chọn)"
              className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary"
            />
            <textarea
              name="content"
              rows={4}
              maxLength={3000}
              autoFocus
              placeholder="Bạn đang thắc mắc điều gì? Chia sẻ với cộng đồng EduVerse..."
              className="w-full resize-none rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:border-primary"
              required
            />
            {state.error && <p className="text-sm text-red-500">{state.error}</p>}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">+5 EXP khi đăng bài</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setExpanded(false); formRef.current?.reset(); }}
                  className="rounded-xl border border-foreground/10 px-4 py-2 text-sm text-muted transition hover:bg-foreground/8"
                >
                  Huỷ
                </button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Đang đăng..." : "Đăng bài"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </GlassCard>
  );
}
