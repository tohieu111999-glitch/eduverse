import { prisma } from "./prisma";

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export const QUEST_CODES = {
  FLASHCARD_10: "FLASHCARD_10",
  QUIZ_1: "QUIZ_1",
  POST_1: "POST_1",
  COMMENT_2: "COMMENT_2",
  ONLINE_15: "ONLINE_15",
  LOGIN: "LOGIN",
} as const;

export type QuestCode = (typeof QUEST_CODES)[keyof typeof QUEST_CODES];

/**
 * Increment a quest's progress for the current user today.
 * No-ops if the quest is already completed or doesn't exist.
 */
export async function incrementQuestProgress(userId: string, code: string, amount = 1) {
  const today = getTodayStr();
  const quest = await prisma.dailyQuest.findUnique({ where: { code } });
  if (!quest) return;

  const existing = await prisma.userQuestProgress.findUnique({
    where: { userId_questId_date: { userId, questId: quest.id, date: today } },
    select: { progress: true, completed: true },
  });

  if (existing?.completed) return;

  const newProgress = Math.min((existing?.progress ?? 0) + amount, quest.target);
  const completed = newProgress >= quest.target;

  await prisma.userQuestProgress.upsert({
    where: { userId_questId_date: { userId, questId: quest.id, date: today } },
    create: { userId, questId: quest.id, date: today, progress: newProgress, completed },
    update: { progress: newProgress, completed },
  });
}

/**
 * Load all quests with today's progress for a user.
 */
export async function getTodayQuestsWithProgress(userId: string) {
  const today = getTodayStr();
  const quests = await prisma.dailyQuest.findMany({ orderBy: { expReward: "desc" } });

  const progressRows = await prisma.userQuestProgress.findMany({
    where: { userId, date: today, questId: { in: quests.map((q) => q.id) } },
  });

  const progressByQuestId = new Map(progressRows.map((p) => [p.questId, p]));

  return quests.map((quest) => ({
    quest,
    progress: progressByQuestId.get(quest.id) ?? null,
  }));
}
