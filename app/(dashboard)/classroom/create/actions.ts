"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { generateJoinCode } from "@/src/lib/classroom";

export type CreateClassroomState = { error?: string };

export async function createClassroomAction(
  _prevState: CreateClassroomState,
  formData: FormData,
): Promise<CreateClassroomState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };
  if (session.user.role !== "TEACHER") return { error: "Chỉ tài khoản Giáo viên mới tạo được lớp" };

  const parsed = z.object({ name: z.string().trim().min(2, "Tên lớp phải có ít nhất 2 ký tự").max(80) }).safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  let joinCode = generateJoinCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await prisma.classroom.findUnique({ where: { joinCode } });
    if (!taken) break;
    joinCode = generateJoinCode();
  }

  const classroom = await prisma.classroom.create({
    data: { name: parsed.data.name, teacherId: session.user.id, joinCode },
  });

  redirect(`/classroom/${classroom.id}`);
}
