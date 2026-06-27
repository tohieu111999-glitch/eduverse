"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteQuizAction } from "./actions";

export function DeleteQuizButton({ quizId }: { quizId: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Xoá quiz này? Hành động này không thể hoàn tác.")) return;
    setPending(true);
    await deleteQuizAction(quizId);
  }

  return (
    <button onClick={handleDelete} disabled={pending} className="shrink-0 text-muted hover:text-red-500">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
