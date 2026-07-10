"use server";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export type ClaimResult = { success?: boolean; coins?: number; error?: string };

export async function claimStreakRewardAction(milestone: 7 | 30): Promise<ClaimResult> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, streak7Claimed: true, streak30Claimed: true, coins: true },
  });
  if (!user) return { error: "Không tìm thấy người dùng" };

  if (milestone === 7) {
    if (user.streak < 7) return { error: "Chuỗi ngày chưa đủ 7 ngày" };
    if (user.streak7Claimed) return { error: "Bạn đã nhận phần thưởng này rồi" };
    await prisma.user.update({
      where: { id: userId },
      data: { streak7Claimed: true, coins: { increment: 50 } },
    });
    return { success: true, coins: 50 };
  }

  if (milestone === 30) {
    if (user.streak < 30) return { error: "Chuỗi ngày chưa đủ 30 ngày" };
    if (user.streak30Claimed) return { error: "Bạn đã nhận phần thưởng này rồi" };
    await prisma.user.update({
      where: { id: userId },
      data: { streak30Claimed: true, coins: { increment: 300 } },
    });
    return { success: true, coins: 300 };
  }

  return { error: "Không hợp lệ" };
}
