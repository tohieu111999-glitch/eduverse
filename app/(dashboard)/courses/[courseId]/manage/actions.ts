"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { saveCourseContentFile, extOf } from "@/src/lib/storage";
import { MAX_COURSE_VIDEO_BYTES, MAX_COURSE_FILE_BYTES } from "@/src/lib/courses";

async function requireInstructor(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
  return course?.instructorId === userId;
}

export type SectionState = { error?: string };

export async function addSectionAction(courseId: string, _prevState: SectionState, formData: FormData): Promise<SectionState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };
  if (!(await requireInstructor(courseId, session.user.id))) return { error: "Không có quyền" };

  const title = z.string().trim().min(2, "Tên chương phải có ít nhất 2 ký tự").max(150).safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0]?.message };

  const count = await prisma.courseSection.count({ where: { courseId } });
  await prisma.courseSection.create({ data: { courseId, title: title.data, order: count } });

  revalidatePath(`/courses/${courseId}/manage`);
  return {};
}

export async function deleteSectionAction(courseId: string, sectionId: string) {
  const session = await auth();
  if (!session?.user) return;
  if (!(await requireInstructor(courseId, session.user.id))) return;

  await prisma.courseSection.delete({ where: { id: sectionId } });
  revalidatePath(`/courses/${courseId}/manage`);
}

const addLessonSchema = z
  .object({
    title: z.string().trim().min(2, "Tên bài học phải có ít nhất 2 ký tự").max(150),
    type: z.enum(["VIDEO", "PDF", "ARTICLE", "ASSIGNMENT", "QUIZ"]),
    videoSource: z.enum(["upload", "url"]).optional(),
    videoUrl: z.string().trim().max(500).optional(),
    content: z.string().trim().max(20000).optional(),
    assignmentPrompt: z.string().trim().max(2000).optional(),
    quizId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "ARTICLE" && !data.content?.trim()) {
      ctx.addIssue({ code: "custom", message: "Vui lòng nhập nội dung bài viết", path: ["content"] });
    }
    if (data.type === "ASSIGNMENT" && !data.assignmentPrompt?.trim()) {
      ctx.addIssue({ code: "custom", message: "Vui lòng nhập đề bài tập", path: ["assignmentPrompt"] });
    }
    if (data.type === "QUIZ" && !data.quizId) {
      ctx.addIssue({ code: "custom", message: "Vui lòng chọn một bài quiz", path: ["quizId"] });
    }
    if (data.type === "VIDEO" && data.videoSource === "url" && !data.videoUrl?.trim()) {
      ctx.addIssue({ code: "custom", message: "Vui lòng dán link video", path: ["videoUrl"] });
    }
  });

export type AddLessonState = { error?: string };

export async function addLessonAction(
  courseId: string,
  sectionId: string,
  _prevState: AddLessonState,
  formData: FormData,
): Promise<AddLessonState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };
  if (!(await requireInstructor(courseId, session.user.id))) return { error: "Không có quyền" };

  const parsed = addLessonSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    videoSource: formData.get("videoSource") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    content: formData.get("content") || undefined,
    assignmentPrompt: formData.get("assignmentPrompt") || undefined,
    quizId: formData.get("quizId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  let videoUrl: string | null = null;
  let fileUrl: string | null = null;

  if (parsed.data.type === "VIDEO") {
    if (parsed.data.videoSource === "url") {
      videoUrl = parsed.data.videoUrl ?? null;
    } else {
      const file = formData.get("videoFile");
      if (!(file instanceof File) || file.size === 0) return { error: "Vui lòng chọn file video" };
      if (file.size > MAX_COURSE_VIDEO_BYTES) return { error: "File video tối đa 300MB" };
      const storageKey = await saveCourseContentFile(file, extOf(file.name) || ".mp4");
      videoUrl = storageKey;
    }
  } else if (parsed.data.type === "PDF") {
    const file = formData.get("pdfFile");
    if (!(file instanceof File) || file.size === 0) return { error: "Vui lòng chọn file PDF" };
    if (file.size > MAX_COURSE_FILE_BYTES) return { error: "File tối đa 20MB" };
    fileUrl = await saveCourseContentFile(file, extOf(file.name) || ".pdf");
  }

  if (parsed.data.type === "QUIZ" && parsed.data.quizId) {
    const quiz = await prisma.quiz.findUnique({ where: { id: parsed.data.quizId }, select: { ownerId: true } });
    if (quiz?.ownerId !== session.user.id) return { error: "Quiz không hợp lệ" };
  }

  const count = await prisma.courseLesson.count({ where: { sectionId } });

  const lesson = await prisma.courseLesson.create({
    data: {
      sectionId,
      title: parsed.data.title,
      type: parsed.data.type,
      videoUrl,
      fileUrl,
      content: parsed.data.type === "ARTICLE" ? parsed.data.content : null,
      quizId: parsed.data.type === "QUIZ" ? parsed.data.quizId : null,
      order: count,
    },
  });

  if (parsed.data.type === "ASSIGNMENT" && parsed.data.assignmentPrompt) {
    await prisma.assignment.create({ data: { lessonId: lesson.id, prompt: parsed.data.assignmentPrompt } });
  }

  revalidatePath(`/courses/${courseId}/manage`);
  return {};
}

export async function deleteLessonAction(courseId: string, lessonId: string) {
  const session = await auth();
  if (!session?.user) return;
  if (!(await requireInstructor(courseId, session.user.id))) return;

  await prisma.courseLesson.delete({ where: { id: lessonId } });
  revalidatePath(`/courses/${courseId}/manage`);
}
