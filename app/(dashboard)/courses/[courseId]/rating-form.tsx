"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { rateCourseAction, type RatingState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: RatingState = {};

export function RatingForm({ courseId, currentStars }: { courseId: string; currentStars?: number }) {
  const [stars, setStars] = useState(currentStars ?? 5);
  const action = rateCourseAction.bind(null, courseId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setStars(n)} aria-label={`${n} sao`}>
            <Star className={`h-5 w-5 ${n <= stars ? "fill-accent text-accent" : "text-muted"}`} />
          </button>
        ))}
        <input type="hidden" name="stars" value={stars} />
      </div>
      <textarea
        name="comment"
        rows={2}
        placeholder="Nhận xét của bạn (tuỳ chọn)..."
        className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
      <Button type="submit" disabled={pending} variant="glass">
        {pending ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </form>
  );
}
