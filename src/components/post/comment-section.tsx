"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { addCommentAction, type AddCommentState } from "@/src/lib/post-interactions";
import { Button } from "@/src/components/ui/button";

type CommentItem = {
  id: string;
  content: string;
  author: { displayName: string | null; username: string | null };
};

const initialState: AddCommentState = {};

export function CommentSection({ postId, comments, count }: { postId: string; comments: CommentItem[]; count: number }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const action = addCommentAction.bind(null, postId);
  const [state, formAction, pending] = useActionState(async (prev: AddCommentState, formData: FormData) => {
    const result = await action(prev, formData);
    if (!result.error) {
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  }, initialState);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-muted transition hover:text-foreground"
      >
        <MessageSquare className="h-4 w-4" /> {count}
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-foreground/10 pt-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-foreground/5 px-3 py-2 text-sm">
              <span className="font-medium">{c.author.displayName ?? c.author.username ?? "Người dùng"}:</span>{" "}
              <span>{c.content}</span>
            </div>
          ))}

          <form ref={formRef} action={formAction} className="flex gap-2">
            <input
              name="content"
              placeholder="Viết bình luận..."
              maxLength={1000}
              className="flex-1 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm outline-none focus:border-primary"
              required
            />
            <Button type="submit" variant="glass" disabled={pending}>
              Gửi
            </Button>
          </form>
          {state.error && <p className="text-xs text-red-500">{state.error}</p>}
        </div>
      )}
    </div>
  );
}
