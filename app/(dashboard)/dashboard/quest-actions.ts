"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getTodayStr, QUEST_CODES } from "@/src/lib/daily-quests";

export type ClaimState = {
  error?: string;
  success?: boolean;
  allComplete?: boolean;
  expGained?: number;
  coinsGained?: number;
};

export async function claimQuestRewardAction(questId: string): Promise<ClaimState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const today = getTodayStr();

  const progress = await prisma.userQuestProgress.findUnique({
    where: { userId_questId_date: { userId: session.user.id, questId, date: today } },
    include: { quest: true },
  });

  if (!progress) return { error: "Chưa có tiến độ nhiệm vụ hôm nay" };
  if (!progress.completed) return { error: "Chưa hoàn thành nhiệm vụ" };
  if (progress.claimedAt) return { error: "Đã nhận thưởng rồi" };

  await prisma.userQuestProgress.update({
    where: { id: progress.id },
    data: { claimedAt: new Date() },
  });

  const { expReward, coinReward } = progress.quest;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      exp: { increment: expReward },
      coins: { increment: coinReward },
    },
  });

  // Check all-complete bonus
  const allQuests = await prisma.dailyQuest.findMany({ select: { id: true } });
  const allProgress = await prisma.userQuestProgress.findMany({
    where: { userId: session.user.id, date: today, questId: { in: allQuests.map((q) => q.id) } },
    select: { questId: true, claimedAt: true },
  });

  const allClaimed = allQuests.every(
    (q) => allProgress.find((p) => p.questId === q.id)?.claimedAt != null,
  );

  if (allClaimed) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { coins: { increment: 20 } },
    });
  }

  revalidatePath("/dashboard");
  return { success: true, allComplete: allClaimed, expGained: expReward, coinsGained: coinReward };
}

export async function recordOnlineTimeAction(minutes: number): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const today = getTodayStr();
  const quest = await prisma.dailyQuest.findUnique({ where: { code: QUEST_CODES.ONLINE_15 } });
  if (!quest) return;

  const existing = await prisma.userQuestProgress.findUnique({
    where: { userId_questId_date: { userId: session.user.id, questId: quest.id, date: today } },
    select: { completed: true },
  });
  if (existing?.completed) return;

  const capped = Math.min(minutes, quest.target);
  const completed = capped >= quest.target;

  await prisma.userQuestProgress.upsert({
    where: { userId_questId_date: { userId: session.user.id, questId: quest.id, date: today } },
    create: { userId: session.user.id, questId: quest.id, date: today, progress: capped, completed },
    update: { progress: capped, completed },
  });

  revalidatePath("/dashboard");
}
