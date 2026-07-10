"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { awardExp } from "@/src/lib/gamification";
import { awardAchievement } from "@/src/lib/achievements";
import { incrementQuestProgress, QUEST_CODES } from "@/src/lib/daily-quests";

const postSchema = z.object({
  title: z.string().trim().max(120, "Tiêu đề tối đa 120 ký tự").optional(),
  content: z.string().trim().min(1, "Nội dung không được để trống").max(3000, "Nội dung tối đa 3000 ký tự"),
});

export type CreatePostState = { error?: string };

export async function createPostAction(
  _prevState: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập để đăng bài" };

  const rawTitle = (formData.get("title") as string | null)?.trim() || undefined;
  const parsed = postSchema.safeParse({
    title: rawTitle || undefined,
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.post.create({
    data: {
      title: parsed.data.title ?? null,
      content: parsed.data.content,
      authorId: session.user.id,
    },
  });
  await awardExp(session.user.id, 5);
  await incrementQuestProgress(session.user.id, QUEST_CODES.POST_1);

  const postCount = await prisma.post.count({ where: { authorId: session.user.id } });
  if (postCount === 1) await awardAchievement(session.user.id, "FIRST_POST");
  if (postCount === 10) await awardAchievement(session.user.id, "TEN_POSTS");

  revalidatePath("/community");
  return {};
}

export async function pinPostAction(postId: string, pin: boolean): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") return;

  await prisma.post.update({ where: { id: postId }, data: { isPinned: pin } });
  revalidatePath("/community");
}
