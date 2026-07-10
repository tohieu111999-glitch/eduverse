"use server";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { generatePaymentRef } from "@/src/lib/payment";
import { awardAchievement } from "@/src/lib/achievements";

export async function createDocumentOrderAction(
  documentId: string,
): Promise<{ orderId: string; paymentRef: string } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const doc = await prisma.document.findUnique({
    where: { id: documentId, status: "APPROVED" },
    select: { sellerId: true, price: true },
  });
  if (!doc) return { error: "Không tìm thấy tài liệu" };
  if (doc.sellerId === session.user.id) return { error: "Bạn không thể mua tài liệu của chính mình" };

  const existing = await prisma.order.findFirst({
    where: { buyerId: session.user.id, documentId, status: { in: ["PAID", "COMPLETED"] } },
  });
  if (existing) return { error: "Bạn đã mua tài liệu này" };

  if (doc.price === 0) {
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: doc.sellerId,
        documentId,
        amountVnd: 0,
        status: "PAID",
        paidAt: new Date(),
      },
    });
    await prisma.document.update({ where: { id: documentId }, data: { downloads: { increment: 1 } } });
    await awardAchievement(session.user.id, "FIRST_PURCHASE");
    return { orderId: order.id, paymentRef: "FREE" };
  }

  const paymentRef = generatePaymentRef("DOC");
  const order = await prisma.order.create({
    data: {
      buyerId: session.user.id,
      sellerId: doc.sellerId,
      documentId,
      amountVnd: doc.price,
      paymentRef,
      status: "PENDING",
    },
  });

  return { orderId: order.id, paymentRef };
}

export async function confirmDocumentPaymentAction(
  orderId: string,
): Promise<{ success: boolean } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true, status: true, documentId: true, sellerId: true },
  });

  if (!order) return { error: "Không tìm thấy đơn hàng" };
  if (order.buyerId !== session.user.id) return { error: "Không có quyền truy cập" };
  if (order.status !== "PENDING") return { error: "Đơn hàng đã được xử lý" };
  if (!order.documentId) return { error: "Đơn hàng không hợp lệ" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paidAt: new Date() },
  });

  await prisma.document.update({
    where: { id: order.documentId },
    data: { downloads: { increment: 1 } },
  });

  await awardAchievement(session.user.id, "FIRST_PURCHASE");

  const sellerSales = await prisma.order.count({ where: { sellerId: order.sellerId, status: { in: ["PAID", "COMPLETED"] } } });
  if (sellerSales === 1) await awardAchievement(order.sellerId, "FIRST_SALE");

  return { success: true };
}
