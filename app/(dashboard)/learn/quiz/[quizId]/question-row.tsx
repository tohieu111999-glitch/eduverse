"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteQuestionAction } from "./actions";

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  FILL_BLANK: "Điền từ",
  LISTENING: "Nghe hiểu",
  SPEAKING: "Nói",
};

export function QuestionRow({
  quizId,
  questionId,
  type,
  prompt,
  canDelete,
}: {
  quizId: string;
  questionId: string;
  type: string;
  prompt: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await deleteQuestionAction(quizId, questionId);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="flex-1">
        <span className="mr-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{TYPE_LABELS[type]}</span>
        <span>{prompt}</span>
      </div>
      {canDelete && (
        <button onClick={handleDelete} disabled={pending} className="text-muted hover:text-red-500">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
