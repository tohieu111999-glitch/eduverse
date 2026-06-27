"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export type JoinClassroomState = { error?: string };

export async function joinClassroomAction(
  _prevState: JoinClassroomState,
  formData: FormData,
): Promise<JoinClassroomState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const parsed = z
    .object({ joinCode: z.string().trim().toUpperCase().min(1, "Vui lòng nhập mã lớp") })
    .safeParse({ joinCode: formData.get("joinCode") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const classroom = await prisma.classroom.findUnique({ where: { joinCode: parsed.data.joinCode } });
  if (!classroom) return { error: "Mã lớp không hợp lệ" };

  const existing = await prisma.classroomMember.findUnique({
    where: { classroomId_studentId: { classroomId: classroom.id, studentId: session.user.id } },
  });
  if (existing) redirect(`/classroom/${classroom.id}`);

  await prisma.classroomMember.create({ data: { classroomId: classroom.id, studentId: session.user.id } });
  redirect(`/classroom/${classroom.id}`);
}
