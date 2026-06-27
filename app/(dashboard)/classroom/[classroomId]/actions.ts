"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { canManageClassroom } from "@/src/lib/classroom";

// Visually-unambiguous alphabet, same rationale as join codes — a teacher
// reads this off-screen to hand to a student.
const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function generateTempPassword(length = 10): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => PASSWORD_ALPHABET[b % PASSWORD_ALPHABET.length]).join("");
}

async function loadClassroomForManage(classroomId: string, userId: string) {
  const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
  if (!classroom) return null;
  if (!(await canManageClassroom(classroom, userId))) return null;
  return classroom;
}

export type CreateStudentState = { error?: string; created?: { username: string; password: string } };

export async function createStudentAccountAction(
  classroomId: string,
  _prevState: CreateStudentState,
  formData: FormData,
): Promise<CreateStudentState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const classroom = await loadClassroomForManage(classroomId, session.user.id);
  if (!classroom) return { error: "Bạn không có quyền quản lý lớp này" };

  const parsed = z
    .object({
      displayName: z.string().trim().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").max(50),
      username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
        .max(20)
        .regex(/^[a-z0-9_]+$/, "Chỉ dùng chữ thường, số và gạch dưới"),
    })
    .safeParse({ displayName: formData.get("displayName"), username: formData.get("username") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) return { error: "Tên đăng nhập này đã được sử dụng" };

  const password = generateTempPassword();
  const hashed = await bcrypt.hash(password, 12);

  const student = await prisma.user.create({
    data: {
      displayName: parsed.data.displayName,
      name: parsed.data.displayName,
      username: parsed.data.username,
      password: hashed,
      role: "STUDENT",
    },
  });

  await prisma.classroomMember.create({ data: { classroomId, studentId: student.id } });

  revalidatePath(`/classroom/${classroomId}`);
  return { created: { username: student.username!, password } };
}

export async function removeStudentAction(classroomId: string, studentId: string) {
  const session = await auth();
  if (!session?.user) return;

  const classroom = await loadClassroomForManage(classroomId, session.user.id);
  if (!classroom) return;

  await prisma.classroomMember.deleteMany({ where: { classroomId, studentId } });
  revalidatePath(`/classroom/${classroomId}`);
}

export async function deleteClassroomAction(classroomId: string) {
  const session = await auth();
  if (!session?.user) return;

  const classroom = await loadClassroomForManage(classroomId, session.user.id);
  if (!classroom) return;

  await prisma.classroom.delete({ where: { id: classroomId } });
  redirect("/classroom");
}
