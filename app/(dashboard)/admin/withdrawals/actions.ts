"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/admin";
import { logAudit } from "@/src/lib/audit";

export type ModerateWithdrawalState = { error?: string };

export async function moderateWithdrawalAction(
  withdrawalId: string,
  decision: "COMPLETED" | "REJECTED",
): Promise<ModerateWithdrawalState> {
  const session = await requireAdmin();
  if (!session) return { error: "Không có quyền truy cập" };

  const result = await prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal || withdrawal.status !== "PENDING") return null;

    await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: decision, processedAt: new Date() },
    });

    // REJECTED refunds the coins that were held in escrow at request time;
    // COMPLETED means the admin already wired the money manually outside
    // the app, so the held coins simply stay deducted.
    if (decision === "REJECTED") {
      await tx.user.update({ where: { id: withdrawal.userId }, data: { coins: { increment: withdrawal.coins } } });
    }

    return withdrawal;
  });

  if (result) {
    await logAudit({
      actorId: session.user.id,
      action: decision === "COMPLETED" ? "WITHDRAWAL_COMPLETED" : "WITHDRAWAL_REJECTED",
      targetType: "Withdrawal",
      targetId: withdrawalId,
      metadata: { userId: result.userId, coins: result.coins, amountVnd: result.amountVnd },
    });
  }

  revalidatePath("/admin/withdrawals");
  revalidatePath("/withdraw");
  return {};
}
