"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateVisibilityAction } from "./actions";
import { QUIZ_VISIBILITIES } from "@/src/lib/quiz";

export function VisibilitySelect({ quizId, visibility }: { quizId: string; visibility: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(value: string) {
    setPending(true);
    await updateVisibilityAction(quizId, value);
    setPending(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={visibility}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-foreground/10 bg-foreground/5 px-2 py-1 text-xs outline-none focus:border-primary disabled:opacity-50"
    >
      {QUIZ_VISIBILITIES.map((v) => (
        <option key={v.value} value={v.value}>
          {v.label}
        </option>
      ))}
    </select>
  );
}
