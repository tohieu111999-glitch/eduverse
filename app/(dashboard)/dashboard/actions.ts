"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { awardExp } from "@/src/lib/gamification";
import { awardAchievement } from "@/src/lib/achievements";

const postSchema = z.object({
  content: z.string().trim().min(1, "Nội dung không được để trống").max(2000, "Nội dung tối đa 2000 ký tự"),
});

export type CreatePostState = {
  error?: string;
};

export async function createPostAction(_prevState: CreatePostState, formData: FormData): Promise<CreatePostState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập để đăng bài" };

  const parsed = postSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.post.create({
    data: { content: parsed.data.content, authorId: session.user.id },
  });
  await awardExp(session.user.id, 10);

  const postCount = await prisma.post.count({ where: { authorId: session.user.id } });
  if (postCount === 1) await awardAchievement(session.user.id, "FIRST_POST");
  if (postCount === 10) await awardAchievement(session.user.id, "TEN_POSTS");

  revalidatePath("/dashboard");
  return {};
}
