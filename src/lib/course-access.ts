import { prisma } from "@/src/lib/prisma";

export async function canAccessCourseContent(courseId: string, userId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
  if (!course) return false;
  if (course.instructorId === userId) return true;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") return true;

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  return Boolean(enrollment);
}
