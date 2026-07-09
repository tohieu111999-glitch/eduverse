"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { awardAchievement } from "@/src/lib/achievements";

export async function markLessonCompleteAction(courseId: string, lessonId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId: session.user.id } },
  });
  if (!enrollment) return { error: "Bạn chưa đăng ký khoá học này" };

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    create: { userId: session.user.id, lessonId, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date() },
  });

  // Check full course completion
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { sections: { include: { lessons: { select: { id: true } } } } },
  });
  if (course && !enrollment.completedAt) {
    const allLessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
    const completedCount = await prisma.lessonProgress.count({
      where: { userId: session.user.id, lessonId: { in: allLessonIds }, completed: true },
    });
    if (completedCount >= allLessonIds.length) {
      await prisma.courseEnrollment.update({
        where: { courseId_userId: { courseId, userId: session.user.id } },
        data: { completedAt: new Date() },
      });
      await awardAchievement(session.user.id, "FIRST_COURSE_COMPLETED");
    }
  }

  revalidatePath(`/courses/${courseId}/learn/${lessonId}`);
  return {};
}

export type SubmitState = { error?: string; success?: boolean };

export async function submitAssignmentAction(
  courseId: string,
  lessonId: string,
  _prevState: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId: session.user.id } },
  });
  if (!enrollment) return { error: "Bạn chưa đăng ký khoá học này" };

  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 10) return { error: "Bài nộp phải có ít nhất 10 ký tự" };
  if (content.length > 10000) return { error: "Bài nộp tối đa 10.000 ký tự" };

  const assignment = await prisma.assignment.findUnique({ where: { lessonId } });
  if (!assignment) return { error: "Không tìm thấy bài tập" };

  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_userId: { assignmentId: assignment.id, userId: session.user.id } },
    create: { assignmentId: assignment.id, userId: session.user.id, content },
    update: { content, score: null, feedback: null, gradedBy: null, submittedAt: new Date() },
  });

  revalidatePath(`/courses/${courseId}/learn/${lessonId}`);
  return { success: true };
}
