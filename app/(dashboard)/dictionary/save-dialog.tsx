"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { BookmarkPlus, Check, Plus, X } from "lucide-react";
import { saveToFlashcardAction, createDeckAndSaveAction } from "./actions";
import type { FlashcardDeck } from "@prisma/client";

type Props = {
  front: string;
  back: string;
  decks: Pick<FlashcardDeck, "id" | "name">[];
};

export function SaveDialog({ front, back, decks }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState(decks[0]?.id ?? "");
  const [newDeckName, setNewDeckName] = useState("");
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError("");
    startTransition(async () => {
      let res;
      if (mode === "new") {
        res = await createDeckAndSaveAction(newDeckName, front, back);
      } else {
        res = await saveToFlashcardAction(selectedDeckId, front, back);
      }
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => {
          setOpen(false);
          setSaved(false);
        }, 1200);
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary">
          <BookmarkPlus className="h-4 w-4" />
          Lưu vào sổ tay
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="glass fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-semibold">Lưu vào sổ tay</Dialog.Title>
            <Dialog.Close className="text-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Preview card */}
          <div className="mb-4 rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">
            <p className="font-semibold text-primary">{front}</p>
            <p className="mt-1 text-muted">{back}</p>
          </div>

          {/* Mode toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setMode("pick")}
              className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${mode === "pick" ? "border-primary bg-primary/10 text-primary" : "border-foreground/10 text-muted hover:text-foreground"}`}
            >
              Chọn bộ thẻ
            </button>
            <button
              onClick={() => setMode("new")}
              className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${mode === "new" ? "border-primary bg-primary/10 text-primary" : "border-foreground/10 text-muted hover:text-foreground"}`}
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" />
              Tạo mới
            </button>
          </div>

          {mode === "pick" ? (
            decks.length === 0 ? (
              <p className="text-sm text-muted">Bạn chưa có bộ thẻ nào. Hãy tạo mới!</p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {decks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => setSelectedDeckId(deck.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${selectedDeckId === deck.id ? "bg-primary/10 text-primary" : "hover:bg-foreground/5"}`}
                  >
                    {deck.name}
                    {selectedDeckId === deck.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )
          ) : (
            <input
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Tên bộ thẻ mới..."
              className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
              autoFocus
            />
          )}

          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={pending || saved || (mode === "pick" && !selectedDeckId) || (mode === "new" && !newDeckName.trim())}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Đã lưu!
              </>
            ) : pending ? (
              "Đang lưu..."
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" /> Lưu thẻ
              </>
            )}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
