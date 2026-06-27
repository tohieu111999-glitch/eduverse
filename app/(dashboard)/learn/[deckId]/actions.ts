"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const addCardSchema = z.object({
  front: z.string().trim().min(1, "Mặt trước không được để trống").max(500, "Tối đa 500 ký tự"),
  back: z.string().trim().min(1, "Mặt sau không được để trống").max(500, "Tối đa 500 ký tự"),
});

export type AddCardState = { error?: string };

export async function addCardAction(deckId: string, _prevState: AddCardState, formData: FormData): Promise<AddCardState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const parsed = addCardSchema.safeParse({ front: formData.get("front"), back: formData.get("back") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.flashcard.create({
    data: { deckId, front: parsed.data.front, back: parsed.data.back },
  });

  revalidatePath(`/learn/${deckId}`);
  return {};
}

export async function deleteCardAction(deckId: string, cardId: string) {
  const session = await auth();
  if (!session?.user) return;

  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId }, select: { ownerId: true } });
  if (deck?.ownerId !== session.user.id) return;

  await prisma.flashcard.delete({ where: { id: cardId } });
  revalidatePath(`/learn/${deckId}`);
}

export async function deleteDeckAction(deckId: string) {
  const session = await auth();
  if (!session?.user) return;

  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId }, select: { ownerId: true } });
  if (deck?.ownerId !== session.user.id) return;

  await prisma.flashcardDeck.delete({ where: { id: deckId } });
  redirect("/learn");
}
