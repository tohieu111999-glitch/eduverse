"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReviewAction } from "./actions";
import { QUALITY_LABELS, type Quality } from "@/src/lib/srs";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";
import { TranslateLookup } from "@/src/components/translate/translate-lookup";

type Card = { id: string; front: string; back: string };

export function ReviewSession({ deckId, cards }: { deckId: string; cards: Card[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const card = cards[index];

  function handleCardClick() {
    // Don't flip the card out from under a selection the user just made to
    // translate — only flip on a genuine click with nothing selected.
    if (window.getSelection()?.toString()) return;
    setFlipped((f) => !f);
  }

  async function handleRate(quality: Quality) {
    setPending(true);
    await submitReviewAction(card.id, quality);
    setPending(false);

    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  if (done) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-semibold">Hoàn thành ôn tập!</p>
        <p className="mt-1 text-sm text-muted">
          Bạn đã ôn tập {cards.length} thẻ. +{cards.length * 2} EXP
        </p>
        <Button onClick={() => router.push(`/learn/${deckId}`)} className="mt-4">
          Quay lại bộ thẻ
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-muted">
        {index + 1} / {cards.length}
      </p>
      <GlassCard
        onClick={handleCardClick}
        className="flex min-h-48 cursor-pointer items-center justify-center p-8 text-center"
      >
        <TranslateLookup>
          <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
        </TranslateLookup>
      </GlassCard>
      {!flipped ? (
        <Button onClick={() => setFlipped(true)} className="w-full">
          Lật thẻ
        </Button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {QUALITY_LABELS.map(({ value, label }) => (
            <Button key={value} variant="glass" disabled={pending} onClick={() => handleRate(value)}>
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
