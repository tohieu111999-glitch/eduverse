"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { toggleLikeAction } from "@/src/lib/post-interactions";
import { cn } from "@/src/lib/utils";

export function LikeButton({ postId, likedByMe, count }: { postId: string; likedByMe: boolean; count: number }) {
  const [liked, setLiked] = useState(likedByMe);
  const [count_, setCount] = useState(count);
  const [, startTransition] = useTransition();

  function handleClick() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction(postId);
      if (result.error) {
        toast.error(result.error);
        setLiked(liked);
        setCount(count);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn("flex items-center gap-1.5 transition", liked ? "text-red-500" : "text-muted hover:text-red-400")}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {count_}
    </button>
  );
}
