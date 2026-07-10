"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addCommentAction, type AddCommentState } from "@/src/lib/post-interactions";
import { Button } from "@/src/components/ui/button";

const initial: AddCommentState = {};

export function AddCommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const action = addCommentAction.bind(null, postId);

  const [state, formAction, pending] = useActionState(async (prev: AddCommentState, fd: FormData) => {
    const result = await action(prev, fd);
    if (!result.error) {
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  }, initial);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2 pt-2">
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
      {state.error && <p className="text-xs text-red-500 self-center">{state.error}</p>}
    </form>
  );
}
