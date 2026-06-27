"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { splitCommission } from "@/src/lib/marketplace";
import { awardAchievement } from "@/src/lib/achievements";

export type PurchaseState = {
  error?: string;
  success?: boolean;
  sellerId?: string;
};

export async function purchaseDocumentAction(documentId: string): Promise<PurchaseState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập để mua tài liệu" };

  const result = await prisma.$transaction(async (tx) => {
    const doc = await tx.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.status !== "APPROVED") return { error: "Tài liệu không khả dụng" };
    if (doc.sellerId === session.user.id) return { error: "Bạn không thể mua tài liệu của chính mình" };

    const alreadyOwned = await tx.order.findFirst({
      where: { buyerId: session.user.id, documentId, status: "COMPLETED" },
    });
    if (alreadyOwned) return { error: "Bạn đã sở hữu tài liệu này" };

    const buyer = await tx.user.findUnique({ where: { id: session.user.id }, select: { coins: true } });
    if (!buyer || buyer.coins < doc.price) return { error: "Số dư coins không đủ để mua tài liệu này" };

    const { commission, sellerPayout } = splitCommission(doc.price);

    await tx.user.update({ where: { id: session.user.id }, data: { coins: { decrement: doc.price } } });
    await tx.user.update({ where: { id: doc.sellerId }, data: { coins: { increment: sellerPayout } } });
    await tx.document.update({ where: { id: doc.id }, data: { downloads: { increment: 1 } } });
    await tx.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: doc.sellerId,
        documentId: doc.id,
        amount: doc.price,
        commission,
        status: "COMPLETED",
      },
    });

    return { success: true, sellerId: doc.sellerId };
  });

  if (result.success && result.sellerId) {
    revalidatePath(`/marketplace/${documentId}`);
    await awardAchievement(session.user.id, "FIRST_PURCHASE");

    const sellerSales = await prisma.order.count({ where: { sellerId: result.sellerId, status: "COMPLETED" } });
    if (sellerSales === 1) await awardAchievement(result.sellerId, "FIRST_SALE");
  }
  return result;
}
