import { notFound, redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { ReviewSession } from "./review-session";

export default async function ReviewPage({ params }: { params: Promise<{ deckId: string }> }) {
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
  if (deck.cards.length === 0) notFound();

  const now = new Date();
  const dueCards = deck.cards.filter((card) => {
    const review = card.reviews[0];
    return !review || review.dueAt <= now;
  });

  // Nothing due — let the user freely re-review the whole deck anyway.
  const cardsForSession = dueCards.length > 0 ? dueCards : deck.cards;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-center text-lg font-semibold">{deck.name}</h1>
      <ReviewSession
        deckId={deck.id}
        cards={cardsForSession.map((c) => ({ id: c.id, front: c.front, back: c.back }))}
      />
    </div>
  );
}
