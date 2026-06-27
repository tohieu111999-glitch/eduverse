"use server";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function toggleFollowAction(targetUserId: string): Promise<{ error?: string; following?: boolean }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };
  if (session.user.id === targetUserId) return { error: "Bạn không thể tự theo dõi mình" };

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }

  await prisma.follow.create({ data: { followerId: session.user.id, followingId: targetUserId } });
  return { following: true };
}
