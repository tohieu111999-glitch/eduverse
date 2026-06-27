"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteDeckAction } from "./actions";

export function DeleteDeckButton({ deckId }: { deckId: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Xoá bộ thẻ này? Hành động này không thể hoàn tác.")) return;
    setPending(true);
    await deleteDeckAction(deckId);
  }

  return (
    <button onClick={handleDelete} disabled={pending} className="shrink-0 text-muted hover:text-red-500">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
