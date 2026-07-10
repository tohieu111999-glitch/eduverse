import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { LearnPageClient } from "./learn-page-client";

export type DeckCard = {
  id: string;
  name: string;
  description: string | null;
  language: string;
  isSystem: boolean;
  isVip: boolean;
  totalCards: number;
  dueCount: number;
  newCount: number;
};

export type SRStats = {
  l1: number; l2: number; l3: number; l4: number; l5: number;
  dueTotal: number;
};

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vipLevel: true },
  });
  const isVip = user?.vipLevel !== "FREE";

  const now = new Date();

  // All reviews by this user
  const reviews = await prisma.cardReview.findMany({
    where: { userId },
    select: { repetitions: true, dueAt: true, flashcardId: true },
  });
  const reviewedIds = new Set(reviews.map((r) => r.flashcardId));

  // Compute SR level counts
  const l1 = reviews.filter((r) => r.repetitions === 0).length;
  const l2 = reviews.filter((r) => r.repetitions === 1).length;
  const l3 = reviews.filter((r) => r.repetitions === 2).length;
  const l4 = reviews.filter((r) => r.repetitions >= 3 && r.repetitions <= 4).length;
  const l5 = reviews.filter((r) => r.repetitions >= 5).length;
  const dueFromReviewed = reviews.filter((r) => r.dueAt <= now).length;

  // User's personal decks
  const personalDecks = await prisma.flashcardDeck.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: { cards: { select: { id: true, reviews: { where: { userId }, select: { dueAt: true } } } } },
  });

  // System decks
  const systemDecks = await prisma.flashcardDeck.findMany({
    where: { isSystem: true },
    orderBy: { createdAt: "asc" },
    include: { cards: { select: { id: true, reviews: { where: { userId }, select: { dueAt: true } } } } },
  });

  function toDeckCard(deck: typeof personalDecks[0]): DeckCard {
    const newCards = deck.cards.filter((c) => !reviewedIds.has(c.id));
    const dueCards = deck.cards.filter((c) => {
      const r = c.reviews[0];
      return r ? r.dueAt <= now : true;
    });
    return {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      language: (deck as typeof systemDecks[0]).language ?? "zh-CN",
      isSystem: (deck as typeof systemDecks[0]).isSystem ?? false,
      isVip: (deck as typeof systemDecks[0]).isVip ?? false,
      totalCards: deck.cards.length,
      dueCount: dueCards.length,
      newCount: newCards.length,
    };
  }

  // New cards across accessible decks (personal + free system + vip if vip user)
  const accessibleNewCount = [
    ...personalDecks,
    ...systemDecks.filter((d) => !d.isVip || isVip),
  ]
    .flatMap((d) => d.cards)
    .filter((c) => !reviewedIds.has(c.id)).length;

  const srStats: SRStats = {
    l1: l1 + accessibleNewCount,
    l2,
    l3,
    l4,
    l5,
    dueTotal: dueFromReviewed + accessibleNewCount,
  };

  return (
    <LearnPageClient
      personalDecks={personalDecks.map(toDeckCard)}
      freeDecks={systemDecks.filter((d) => !d.isVip).map(toDeckCard)}
      vipDecks={systemDecks.filter((d) => d.isVip).map(toDeckCard)}
      srStats={srStats}
      isVip={isVip}
    />
  );
}
