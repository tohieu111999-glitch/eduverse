"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { generateJoinCode } from "@/src/lib/classroom";

async function requireOwnSchool(userId: string) {
  return prisma.school.findUnique({ where: { adminId: userId } });
}

export type AddTeacherState = { error?: string };

export async function addTeacherAction(_prevState: AddTeacherState, formData: FormData): Promise<AddTeacherState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const school = await requireOwnSchool(session.user.id);
  if (!school) return { error: "Bạn chưa quản lý trường nào" };

  const username = z.string().trim().toLowerCase().min(1).safeParse(formData.get("username"));
  if (!username.success) return { error: "Vui lòng nhập tên đăng nhập" };

  const user = await prisma.user.findUnique({ where: { username: username.data } });
  if (!user) return { error: "Không tìm thấy người dùng này" };
  if (user.role !== "TEACHER") return { error: "Người dùng này chưa đăng ký tài khoản Giáo viên" };

  const existing = await prisma.schoolTeacher.findUnique({
    where: { schoolId_teacherId: { schoolId: school.id, teacherId: user.id } },
  });
  if (existing) return { error: "Giáo viên này đã ở trong trường của bạn" };

  await prisma.schoolTeacher.create({ data: { schoolId: school.id, teacherId: user.id } });
  revalidatePath("/school");
  return {};
}

export async function removeTeacherAction(schoolTeacherId: string) {
  const session = await auth();
  if (!session?.user) return;

  const school = await requireOwnSchool(session.user.id);
  if (!school) return;

  await prisma.schoolTeacher.deleteMany({ where: { id: schoolTeacherId, schoolId: school.id } });
  revalidatePath("/school");
}

export type CreateClassroomState = { error?: string };

export async function createSchoolClassroomAction(
  _prevState: CreateClassroomState,
  formData: FormData,
): Promise<CreateClassroomState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const school = await requireOwnSchool(session.user.id);
  if (!school) return { error: "Bạn chưa quản lý trường nào" };

  const parsed = z
    .object({
      name: z.string().trim().min(2, "Tên lớp phải có ít nhất 2 ký tự").max(80),
      teacherId: z.string().min(1, "Vui lòng chọn giáo viên"),
    })
    .safeParse({ name: formData.get("name"), teacherId: formData.get("teacherId") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const isSchoolTeacher = await prisma.schoolTeacher.findUnique({
    where: { schoolId_teacherId: { schoolId: school.id, teacherId: parsed.data.teacherId } },
  });
  if (!isSchoolTeacher) return { error: "Giáo viên này không thuộc trường của bạn" };

  let joinCode = generateJoinCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await prisma.classroom.findUnique({ where: { joinCode } });
    if (!taken) break;
    joinCode = generateJoinCode();
  }

  await prisma.classroom.create({
    data: { name: parsed.data.name, schoolId: school.id, teacherId: parsed.data.teacherId, joinCode },
  });
  revalidatePath("/school");
  return {};
}
