"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { awardExp } from "@/src/lib/gamification";
import { incrementQuestProgress, QUEST_CODES } from "@/src/lib/daily-quests";

export async function toggleLikeAction(postId: string): Promise<{ error?: string; liked?: boolean }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  await prisma.like.create({ data: { postId, userId: session.user.id } });
  return { liked: true };
}

const commentSchema = z.object({
  content: z.string().trim().min(1, "Bình luận không được để trống").max(1000, "Bình luận tối đa 1000 ký tự"),
});

export type AddCommentState = { error?: string };

export async function addCommentAction(postId: string, _prevState: AddCommentState, formData: FormData): Promise<AddCommentState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập để bình luận" };

  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.comment.create({
    data: { content: parsed.data.content, postId, authorId: session.user.id },
  });
  await awardExp(session.user.id, 2);
  await incrementQuestProgress(session.user.id, QUEST_CODES.COMMENT_2);

  revalidatePath("/community");
  return {};
}
