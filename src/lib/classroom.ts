import { randomBytes } from "crypto";
import { prisma } from "@/src/lib/prisma";

// Excludes visually-ambiguous characters (0/O, 1/I) since join codes are
// meant to be read aloud or typed by hand in a classroom.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateJoinCode(length = 6): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

type ClassroomRef = { id: string; teacherId: string; schoolId: string | null };

export async function canManageClassroom(classroom: { teacherId: string; schoolId: string | null }, userId: string): Promise<boolean> {
  if (classroom.teacherId === userId) return true;
  if (!classroom.schoolId) return false;

  const school = await prisma.school.findUnique({ where: { id: classroom.schoolId }, select: { adminId: true } });
  return school?.adminId === userId;
}

export async function canViewClassroom(classroom: ClassroomRef, userId: string): Promise<boolean> {
  if (await canManageClassroom(classroom, userId)) return true;

  const membership = await prisma.classroomMember.findUnique({
    where: { classroomId_studentId: { classroomId: classroom.id, studentId: userId } },
  });
  return Boolean(membership);
}
