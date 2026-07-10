import { prisma } from "./prisma";
import { awardAchievement } from "./achievements";

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, longestStreak: true, lastActiveDate: true },
  });
  if (!user) return;

  const now = new Date();
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setDate(todayMidnight.getDate() - 1);

  // Already counted today — skip
  if (user.lastActiveDate && user.lastActiveDate >= todayMidnight) return;

  let newStreak: number;
  if (user.lastActiveDate && user.lastActiveDate >= yesterdayMidnight) {
    newStreak = user.streak + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, user.longestStreak);
  const resetClaims = newStreak === 1 && user.streak > 0;

  await Promise.all([
    prisma.dailyCheckin.upsert({
      where: { userId_date: { userId, date: todayMidnight } },
      create: { userId, date: todayMidnight },
      update: {},
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: now,
        ...(resetClaims ? { streak7Claimed: false, streak30Claimed: false } : {}),
      },
    }),
  ]);

  if (newStreak >= 7) await awardAchievement(userId, "STREAK_7");
  if (newStreak >= 30) await awardAchievement(userId, "STREAK_30");
  if (newStreak >= 100) await awardAchievement(userId, "STREAK_100");
}
