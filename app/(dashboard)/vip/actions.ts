"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { buildVipPackages, DEFAULT_VIP_CONFIG, LIFETIME_EXPIRY } from "@/src/lib/vip";

export type PurchaseVipState = { error?: string; insufficientCoins?: boolean };

export async function purchaseVipAction(
  _prevState: PurchaseVipState,
  formData: FormData,
): Promise<PurchaseVipState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const key = String(formData.get("key") ?? "");

  const config = await prisma.vipConfig.findFirst() ?? DEFAULT_VIP_CONFIG;
  const packages = buildVipPackages(config);
  const pkg = packages.find((p) => p.key === key);
  if (!pkg) return { error: "Gói VIP không hợp lệ" };

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true, vipExpiresAt: true },
    });
    if (!user || user.coins < pkg.coins) {
      return { error: "Số dư coins không đủ", insufficientCoins: true };
    }

    const now = new Date();
    let newExpiry: Date;
    if (pkg.days === 0) {
      // Lifetime
      newExpiry = LIFETIME_EXPIRY;
    } else {
      const base = user.vipExpiresAt && user.vipExpiresAt > now ? user.vipExpiresAt : now;
      newExpiry = new Date(base.getTime() + pkg.days * 86400_000);
    }

    await tx.user.update({
      where: { id: session.user.id },
      data: { coins: { decrement: pkg.coins }, vipLevel: "VIP", vipExpiresAt: newExpiry },
    });

    await tx.vipPurchase.create({
      data: {
        userId: session.user.id,
        vipLevel: "VIP",
        days: pkg.days === 0 ? 36500 : pkg.days,
        coinsSpent: pkg.coins,
      },
    });

    return {};
  });

  if (!result.error) revalidatePath("/vip");
  return result;
}
