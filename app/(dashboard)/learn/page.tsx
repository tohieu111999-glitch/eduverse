import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, Plus, Trophy } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const decks = await prisma.flashcardDeck.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cards: { include: { reviews: { where: { userId: session.user.id } } } },
      _count: { select: { cards: true } },
    },
  });

  const now = new Date();
  const decksWithDue = decks.map((deck) => {
    const dueCount = deck.cards.filter((card) => {
      const review = card.reviews[0];
      return !review || review.dueAt <= now;
    }).length;
    return { id: deck.id, name: deck.name, description: deck.description, totalCards: deck._count.cards, dueCount };
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Học tập</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/learn/quiz" className={buttonVariants("glass")}>
            <Trophy className="h-4 w-4" />
            Mini Quiz
          </Link>
          <Link href="/learn/create" className={buttonVariants("primary")}>
            <Plus className="h-4 w-4" />
            Tạo bộ thẻ
          </Link>
        </div>
      </div>

      {decksWithDue.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Chưa có bộ thẻ ghi nhớ nào. Hãy tạo bộ thẻ đầu tiên!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {decksWithDue.map((deck) => (
            <Link key={deck.id} href={`/learn/${deck.id}`}>
              <GlassCard className="p-4 transition hover:-translate-y-0.5">
                <h3 className="font-semibold">{deck.name}</h3>
                {deck.description && <p className="mt-1 text-xs text-muted line-clamp-2">{deck.description}</p>}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted">{deck.totalCards} thẻ</span>
                  {deck.dueCount > 0 && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent">
                      {deck.dueCount} cần ôn tập
                    </span>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
