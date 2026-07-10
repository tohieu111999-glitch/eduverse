import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { ReviewSession } from "../[deckId]/review/review-session";

export default async function ReviewAllPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vipLevel: true },
  });
  const isVip = user?.vipLevel !== "FREE";

  // Collect all due/new cards from personal + accessible system decks
  const decks = await prisma.flashcardDeck.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { isSystem: true, isVip: false },
        ...(isVip ? [{ isSystem: true, isVip: true }] : []),
      ],
    },
    include: {
      cards: {
        include: { reviews: { where: { userId } } },
      },
    },
  });

  const dueCards = decks
    .flatMap((d) => d.cards)
    .filter((c) => {
      const r = c.reviews[0];
      return !r || r.dueAt <= now;
    })
    .map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      pinyin: c.pinyin ?? undefined,
      hanViet: c.hanViet ?? undefined,
      example: c.example as { zh: string; pinyin: string; vi: string } | null,
    }));

  if (dueCards.length === 0) redirect("/learn");

  // Shuffle
  const shuffled = dueCards.sort(() => Math.random() - 0.5);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-center text-lg font-semibold">Ôn tập hôm nay</h1>
      <ReviewSession deckId="review-all" cards={shuffled} returnUrl="/learn" />
    </div>
  );
}
