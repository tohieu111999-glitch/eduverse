"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { VIP_PACKAGES } from "@/src/lib/vip";

export type PurchaseVipState = { error?: string };

export async function purchaseVipAction(_prevState: PurchaseVipState, formData: FormData): Promise<PurchaseVipState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const days = Number(formData.get("days"));
  const pkg = VIP_PACKAGES.find((p) => p.days === days);
  if (!pkg) return { error: "Gói VIP không hợp lệ" };

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true, vipExpiresAt: true },
    });
    if (!user || user.coins < pkg.coins) return { error: "Số dư coins không đủ để mua gói VIP này" };

    const now = new Date();
    const base = user.vipExpiresAt && user.vipExpiresAt > now ? user.vipExpiresAt : now;
    const newExpiry = new Date(base.getTime() + pkg.days * 24 * 60 * 60 * 1000);

    await tx.user.update({
      where: { id: session.user.id },
      data: { coins: { decrement: pkg.coins }, vipLevel: "VIP", vipExpiresAt: newExpiry },
    });

    await tx.vipPurchase.create({
      data: { userId: session.user.id, vipLevel: "VIP", days: pkg.days, coinsSpent: pkg.coins },
    });

    return {};
  });

  if (!result.error) revalidatePath("/vip");
  return result;
}
