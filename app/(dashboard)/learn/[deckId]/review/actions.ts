"use server";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { scheduleNextReview, type Quality } from "@/src/lib/srs";
import { awardExp } from "@/src/lib/gamification";
import { awardAchievement } from "@/src/lib/achievements";
import { updateStreak } from "@/src/lib/streak";
import { incrementQuestProgress, QUEST_CODES } from "@/src/lib/daily-quests";

export async function submitReviewAction(flashcardId: string, quality: Quality) {
  const session = await auth();
  if (!session?.user) return;

  const existing = await prisma.cardReview.findUnique({
    where: { userId_flashcardId: { userId: session.user.id, flashcardId } },
  });

  const next = scheduleNextReview(
    existing ?? { easeFactor: 2.5, intervalDays: 0, repetitions: 0 },
    quality,
  );

  await prisma.cardReview.upsert({
    where: { userId_flashcardId: { userId: session.user.id, flashcardId } },
    create: { userId: session.user.id, flashcardId, ...next, lastReviewedAt: new Date() },
    update: { ...next, lastReviewedAt: new Date() },
  });

  await awardExp(session.user.id, 1);
  await updateStreak(session.user.id);

  await incrementQuestProgress(session.user.id, QUEST_CODES.FLASHCARD_10);

  const reviewCount = await prisma.cardReview.count({ where: { userId: session.user.id } });
  if (reviewCount === 1) await awardAchievement(session.user.id, "FIRST_REVIEW");
}
