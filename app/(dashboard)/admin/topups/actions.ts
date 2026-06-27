"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/admin";
import { completeTopup } from "@/src/lib/topup-fulfillment";
import { logAudit } from "@/src/lib/audit";

export type ModerateTopupState = { error?: string };

export async function moderateTopupAction(topupId: string, decision: "COMPLETED" | "CANCELLED"): Promise<ModerateTopupState> {
  const session = await requireAdmin();
  if (!session) return { error: "Không có quyền truy cập" };

  if (decision === "COMPLETED") {
    await completeTopup(topupId, session.user.id);
  } else {
    const topup = await prisma.coinTopup.findUnique({ where: { id: topupId } });
    if (topup?.status === "PENDING") {
      await prisma.coinTopup.update({ where: { id: topupId }, data: { status: "CANCELLED" } });
      await logAudit({
        actorId: session.user.id,
        action: "TOPUP_CANCELLED",
        targetType: "CoinTopup",
        targetId: topupId,
        metadata: { userId: topup.userId, coins: topup.coins, amount: topup.amount },
      });
    }
  }

  revalidatePath("/admin/topups");
  revalidatePath(`/topup/${topupId}`);
  return {};
}
