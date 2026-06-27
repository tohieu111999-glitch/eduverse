"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { QUIZ_LANGUAGE_CODES } from "@/src/lib/quiz";

const createQuizSchema = z.object({
  title: z.string().trim().min(2, "Tên quiz phải có ít nhất 2 ký tự").max(80, "Tên quiz tối đa 80 ký tự"),
  description: z.string().trim().max(300, "Mô tả tối đa 300 ký tự").optional(),
  language: z.enum(QUIZ_LANGUAGE_CODES),
  visibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]),
});

export type CreateQuizState = { error?: string };

export async function createQuizAction(_prevState: CreateQuizState, formData: FormData): Promise<CreateQuizState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const parsed = createQuizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    language: formData.get("language"),
    visibility: formData.get("visibility"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const quiz = await prisma.quiz.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      language: parsed.data.language,
      visibility: parsed.data.visibility,
      ownerId: session.user.id,
    },
  });

  redirect(`/learn/quiz/${quiz.id}`);
}
