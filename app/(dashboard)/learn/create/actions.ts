"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const SUPPORTED_LANGS = ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR", "fr-FR", "vi-VN", "other"] as const;

const createDeckSchema = z.object({
  name: z.string().trim().min(2, "Tên bộ thẻ phải có ít nhất 2 ký tự").max(80, "Tên bộ thẻ tối đa 80 ký tự"),
  description: z.string().trim().max(300, "Mô tả tối đa 300 ký tự").optional(),
  language: z.enum(SUPPORTED_LANGS).default("zh-CN"),
});

export type CreateDeckState = { error?: string };

export async function createDeckAction(_prevState: CreateDeckState, formData: FormData): Promise<CreateDeckState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const parsed = createDeckSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    language: formData.get("language") || "zh-CN",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const deck = await prisma.flashcardDeck.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      language: parsed.data.language,
      ownerId: session.user.id,
    },
  });

  redirect(`/learn/${deck.id}`);
}
