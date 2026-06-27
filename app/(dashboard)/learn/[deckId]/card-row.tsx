"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCardAction } from "./actions";

export function CardRow({
  deckId,
  cardId,
  front,
  back,
  canDelete,
}: {
  deckId: string;
  cardId: string;
  front: string;
  back: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await deleteCardAction(deckId, cardId);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="flex-1">
        <span className="font-medium">{front}</span>
        <span className="text-muted"> → {back}</span>
      </div>
      {canDelete && (
        <button onClick={handleDelete} disabled={pending} className="text-muted hover:text-red-500">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
