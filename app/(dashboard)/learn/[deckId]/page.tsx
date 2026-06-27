import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Play } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { AddCardForm } from "./add-card-form";
import { CardRow } from "./card-row";
import { DeleteDeckButton } from "./delete-deck-button";

export default async function DeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: {
      cards: {
        orderBy: { createdAt: "asc" },
        include: { reviews: { where: { userId: session.user.id } } },
      },
    },
  });
  if (!deck) notFound();

  const isOwner = deck.ownerId === session.user.id;
  const now = new Date();
  const dueCount = deck.cards.filter((card) => {
    const review = card.reviews[0];
    return !review || review.dueAt <= now;
  }).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{deck.name}</h1>
            {deck.description && <p className="mt-1 text-sm text-muted">{deck.description}</p>}
            <p className="mt-2 text-xs text-muted">{deck.cards.length} thẻ · {dueCount} cần ôn tập</p>
          </div>
          {isOwner && <DeleteDeckButton deckId={deck.id} />}
        </div>

        {deck.cards.length > 0 && (
          <Link href={`/learn/${deck.id}/review`} className={buttonVariants("primary", "mt-4 w-full")}>
            <Play className="h-4 w-4" />
            {dueCount > 0 ? `Ôn tập (${dueCount} thẻ)` : "Ôn tập lại"}
          </Link>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-3 text-sm font-medium text-muted">Thêm thẻ mới</h2>
        <AddCardForm deckId={deck.id} />
      </GlassCard>

      {deck.cards.length > 0 && (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {deck.cards.map((card) => (
            <CardRow key={card.id} deckId={deck.id} cardId={card.id} front={card.front} back={card.back} canDelete={isOwner} />
          ))}
        </GlassCard>
      )}
    </div>
  );
}
