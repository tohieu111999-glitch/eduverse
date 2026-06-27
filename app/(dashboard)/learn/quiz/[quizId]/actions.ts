"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { generateQuizQuestions, isAiConfigured } from "@/src/lib/ai";

const addQuestionSchema = z
  .object({
    type: z.enum(["MULTIPLE_CHOICE", "FILL_BLANK", "LISTENING", "SPEAKING"]),
    prompt: z.string().trim().min(1, "Câu hỏi không được để trống").max(500),
    answer: z.string().trim().min(1, "Đáp án không được để trống").max(200),
    option1: z.string().trim().max(100).optional(),
    option2: z.string().trim().max(100).optional(),
    option3: z.string().trim().max(100).optional(),
    option4: z.string().trim().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "MULTIPLE_CHOICE") {
      const options = [data.option1, data.option2, data.option3, data.option4].filter(Boolean);
      if (options.length < 2) {
        ctx.addIssue({ code: "custom", message: "Trắc nghiệm cần ít nhất 2 lựa chọn", path: ["option1"] });
      } else if (!options.includes(data.answer)) {
        ctx.addIssue({ code: "custom", message: "Đáp án phải khớp với một trong các lựa chọn", path: ["answer"] });
      }
    }
  });

export type AddQuestionState = { error?: string };

export async function addQuestionAction(
  quizId: string,
  _prevState: AddQuestionState,
  formData: FormData,
): Promise<AddQuestionState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const quizOwner = await prisma.quiz.findUnique({ where: { id: quizId }, select: { ownerId: true } });
  if (quizOwner?.ownerId !== session.user.id) return { error: "Bạn không có quyền chỉnh sửa quiz này" };

  const parsed = addQuestionSchema.safeParse({
    type: formData.get("type"),
    prompt: formData.get("prompt"),
    answer: formData.get("answer"),
    option1: formData.get("option1") || undefined,
    option2: formData.get("option2") || undefined,
    option3: formData.get("option3") || undefined,
    option4: formData.get("option4") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const options =
    parsed.data.type === "MULTIPLE_CHOICE"
      ? [parsed.data.option1, parsed.data.option2, parsed.data.option3, parsed.data.option4].filter((o): o is string => Boolean(o))
      : [];

  const count = await prisma.quizQuestion.count({ where: { quizId } });

  await prisma.quizQuestion.create({
    data: {
      quizId,
      type: parsed.data.type,
      prompt: parsed.data.prompt,
      answer: parsed.data.answer,
      options,
      order: count,
    },
  });

  revalidatePath(`/learn/quiz/${quizId}`);
  return {};
}

export async function deleteQuestionAction(quizId: string, questionId: string) {
  const session = await auth();
  if (!session?.user) return;

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { ownerId: true } });
  if (quiz?.ownerId !== session.user.id) return;

  await prisma.quizQuestion.delete({ where: { id: questionId } });
  revalidatePath(`/learn/quiz/${quizId}`);
}

export type GenerateQuestionsState = { error?: string; count?: number };

export async function generateQuestionsFromFileAction(
  quizId: string,
  _prevState: GenerateQuestionsState,
  formData: FormData,
): Promise<GenerateQuestionsState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (quiz?.ownerId !== session.user.id) return { error: "Bạn không có quyền chỉnh sửa quiz này" };
  if (!isAiConfigured()) return { error: "AI chưa được cấu hình. Vui lòng thêm ANTHROPIC_API_KEY." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Vui lòng chọn file" };
  if (file.size > 10 * 1024 * 1024) return { error: "File tối đa 10MB" };

  const ext = file.name.toLowerCase().split(".").pop();
  let generated;
  try {
    if (ext === "pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      generated = await generateQuizQuestions({ kind: "pdf", base64: buffer.toString("base64") }, quiz.language);
    } else if (ext === "txt") {
      generated = await generateQuizQuestions({ kind: "text", text: await file.text() }, quiz.language);
    } else {
      return { error: "Chỉ hỗ trợ file .txt hoặc .pdf" };
    }
  } catch {
    return { error: "Không thể tạo câu hỏi từ file này. Vui lòng thử lại." };
  }

  if (generated.length === 0) return { error: "AI không tạo được câu hỏi nào từ file này" };

  const existingCount = await prisma.quizQuestion.count({ where: { quizId } });
  await prisma.quizQuestion.createMany({
    data: generated.map((q, i) => ({
      quizId,
      type: q.type,
      prompt: q.prompt,
      answer: q.answer,
      options: q.options,
      order: existingCount + i,
    })),
  });

  revalidatePath(`/learn/quiz/${quizId}`);
  return { count: generated.length };
}

export async function updateVisibilityAction(quizId: string, visibility: string) {
  const session = await auth();
  if (!session?.user) return;
  if (!["PUBLIC", "FRIENDS", "PRIVATE"].includes(visibility)) return;

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { ownerId: true } });
  if (quiz?.ownerId !== session.user.id) return;

  await prisma.quiz.update({
    where: { id: quizId },
    data: { visibility: visibility as "PUBLIC" | "FRIENDS" | "PRIVATE" },
  });
  revalidatePath(`/learn/quiz/${quizId}`);
  revalidatePath("/learn/quiz");
}

export async function deleteQuizAction(quizId: string) {
  const session = await auth();
  if (!session?.user) return;

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { ownerId: true } });
  if (quiz?.ownerId !== session.user.id) return;

  await prisma.quiz.delete({ where: { id: quizId } });
  redirect("/learn/quiz");
}
