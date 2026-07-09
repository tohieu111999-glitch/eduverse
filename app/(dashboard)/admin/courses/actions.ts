"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/admin";
import { logAudit } from "@/src/lib/audit";

export type ModerateState = { error?: string };

export async function moderateCourseAction(courseId: string, decision: "APPROVED" | "REJECTED"): Promise<ModerateState> {
  const session = await requireAdmin();
  if (!session) return { error: "Không có quyền truy cập" };

  await prisma.course.update({ where: { id: courseId }, data: { status: decision } });
  await logAudit({
    actorId: session.user.id,
    action: decision === "APPROVED" ? "COURSE_APPROVED" : "COURSE_REJECTED",
    targetType: "Course",
    targetId: courseId,
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return {};
}
