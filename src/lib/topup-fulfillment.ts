import { prisma } from "@/src/lib/prisma";
import { awardAchievement } from "@/src/lib/achievements";
import { logAudit } from "@/src/lib/audit";

// Shared by both the admin manual-approval action and the auto-approve path
// on topup creation, so the credit-coins logic only lives in one place.
export async function completeTopup(topupId: string, actorId: string | null) {
  const topup = await prisma.$transaction(async (tx) => {
    const t = await tx.coinTopup.findUnique({ where: { id: topupId } });
    if (!t || t.status !== "PENDING") return null;

    await tx.coinTopup.update({ where: { id: topupId }, data: { status: "COMPLETED" } });
    await tx.user.update({ where: { id: t.userId }, data: { coins: { increment: t.coins } } });
    return t;
  });

  if (!topup) return null;

  await awardAchievement(topup.userId, "FIRST_TOPUP");
  await logAudit({
    actorId,
    action: actorId ? "TOPUP_APPROVED" : "TOPUP_AUTO_APPROVED",
    targetType: "CoinTopup",
    targetId: topup.id,
    metadata: { userId: topup.userId, coins: topup.coins, amount: topup.amount },
  });

  return topup;
}
