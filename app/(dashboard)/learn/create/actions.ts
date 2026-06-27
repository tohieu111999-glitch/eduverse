"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const createDeckSchema = z.object({
  name: z.string().trim().min(2, "Tên bộ thẻ phải có ít nhất 2 ký tự").max(80, "Tên bộ thẻ tối đa 80 ký tự"),
  description: z.string().trim().max(300, "Mô tả tối đa 300 ký tự").optional(),
});

export type CreateDeckState = { error?: string };

export async function createDeckAction(_prevState: CreateDeckState, formData: FormData): Promise<CreateDeckState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const parsed = createDeckSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const deck = await prisma.flashcardDeck.create({
    data: { name: parsed.data.name, description: parsed.data.description, ownerId: session.user.id },
  });

  redirect(`/learn/${deck.id}`);
}
