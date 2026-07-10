"use server";

import { z } from "zod";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const feedbackSchema = z.object({
  content: z.string().trim().min(5, "Góp ý ít nhất 5 ký tự").max(2000, "Tối đa 2000 ký tự"),
});

export type FeedbackState = { error?: string; success?: boolean };

export async function submitFeedbackAction(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const session = await auth();
  const parsed = feedbackSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.feedback.create({
    data: {
      content: parsed.data.content,
      userId: session?.user?.id ?? null,
    },
  });

  return { success: true };
}
