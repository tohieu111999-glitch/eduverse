import { prisma } from "./prisma";
import { expForLevel } from "./utils";
import { checkLevelAchievements } from "./achievements";

export async function awardExp(userId: string, amount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { exp: true, level: true } });
  if (!user) return;

  let exp = user.exp + amount;
  let level = user.level;
  while (exp >= expForLevel(level)) {
    exp -= expForLevel(level);
    level += 1;
  }

  await prisma.user.update({ where: { id: userId }, data: { exp, level } });
  if (level > user.level) await checkLevelAchievements(userId, level);
}
