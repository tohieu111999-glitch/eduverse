"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/admin";
import { logAudit } from "@/src/lib/audit";

type ActionState = { error?: string };

export async function toggleBanAction(targetUserId: string): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { error: "Không có quyền truy cập" };
  if (session.user.id === targetUserId) return { error: "Bạn không thể tự khoá tài khoản của mình" };

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { isBanned: true } });
  if (!target) return { error: "Không tìm thấy người dùng" };

  await prisma.user.update({ where: { id: targetUserId }, data: { isBanned: !target.isBanned } });
  await logAudit({
    actorId: session.user.id,
    action: target.isBanned ? "USER_UNBANNED" : "USER_BANNED",
    targetType: "User",
    targetId: targetUserId,
  });

  revalidatePath("/admin/users");
  return {};
}

export async function changeRoleAction(
  targetUserId: string,
  role: "USER" | "STUDENT" | "TEACHER" | "SCHOOL_ADMIN" | "MODERATOR" | "ADMIN",
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { error: "Không có quyền truy cập" };
  if (session.user.id === targetUserId) return { error: "Bạn không thể tự đổi vai trò của mình" };

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { role: true } });

  await prisma.user.update({ where: { id: targetUserId }, data: { role } });
  await logAudit({
    actorId: session.user.id,
    action: "ROLE_CHANGED",
    targetType: "User",
    targetId: targetUserId,
    metadata: { from: target?.role, to: role },
  });

  revalidatePath("/admin/users");
  return {};
}
