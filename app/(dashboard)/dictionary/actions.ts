"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { lookupWord, type DictDirection, type DictResult } from "@/src/lib/dictionary";
import { awardExp } from "@/src/lib/gamification";
import { updateStreak } from "@/src/lib/streak";

const EXP_PER_SEARCH = 2;
const MAX_SEARCHES_FOR_EXP = 10; // 10 × 2 = 20 EXP/day cap

export async function searchAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const q = formData.get("q")?.toString().trim() ?? "";
  const dir = (formData.get("dir")?.toString() ?? "CN_TO_VI") as DictDirection;

  if (!q) redirect("/dictionary");

  const userId = session.user.id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Reuse cached AI result to avoid repeat API calls
  const cached = await prisma.searchHistory.findFirst({
    where: { userId, query: q, direction: dir, createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: "desc" },
    select: { result: true },
  });

  const cachedResult = cached?.result as DictResult | undefined;
  const result: DictResult =
    cachedResult && !cachedResult.notFound ? cachedResult : await lookupWord(q, dir);

  // Always log the search (for history + EXP tracking)
  await prisma.searchHistory.create({
    data: { userId, query: q, direction: dir, result: result as object },
  });

  await updateStreak(userId);

  // Award EXP (up to daily cap)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await prisma.searchHistory.count({
    where: { userId, createdAt: { gte: today } },
  });
  if (todayCount <= MAX_SEARCHES_FOR_EXP) {
    await awardExp(userId, EXP_PER_SEARCH);
  }

  redirect(`/dictionary?q=${encodeURIComponent(q)}&dir=${dir}`);
}

export type SaveState = { error?: string; success?: boolean };

export async function saveToFlashcardAction(
  deckId: string,
  front: string,
  back: string,
): Promise<SaveState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId }, select: { ownerId: true } });
  if (!deck || deck.ownerId !== session.user.id) return { error: "Không tìm thấy bộ thẻ" };

  await prisma.flashcard.create({ data: { deckId, front, back } });
  revalidatePath(`/learn/${deckId}`);
  return { success: true };
}

export async function createDeckAndSaveAction(
  deckName: string,
  front: string,
  back: string,
): Promise<SaveState & { deckId?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const name = deckName.trim();
  if (!name || name.length > 80) return { error: "Tên bộ thẻ không hợp lệ" };

  const deck = await prisma.flashcardDeck.create({
    data: { name, ownerId: session.user.id },
  });
  await prisma.flashcard.create({ data: { deckId: deck.id, front, back } });
  revalidatePath("/learn");
  return { success: true, deckId: deck.id };
}
