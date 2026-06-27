"use server";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { translateText, isAiConfigured } from "@/src/lib/ai";
import { isVip } from "@/src/lib/vip";
import { estimateMessageCostCoins } from "@/src/lib/ai-billing";

// More generous than FREE_DAILY_AI_LIMIT (chat) since lookups are short,
// cheap, and a normal study session can easily involve dozens of them.
const FREE_DAILY_LOOKUPS = 30;
const MAX_LOOKUP_LENGTH = 500;

export type LookupTranslationState = {
  error?: string;
  translation?: string;
  chargedCoins?: number;
};

export async function lookupTranslationAction(text: string): Promise<LookupTranslationState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };
  if (!isAiConfigured()) return { error: "Tính năng dịch chưa được cấu hình" };

  const trimmed = text.trim();
  if (!trimmed) return { error: "Vui lòng chọn từ/câu cần dịch" };
  if (trimmed.length > MAX_LOOKUP_LENGTH) return { error: `Chỉ dịch được tối đa ${MAX_LOOKUP_LENGTH} ký tự mỗi lần` };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { vipLevel: true, vipExpiresAt: true, coins: true },
  });
  if (!user) return { error: "Không tìm thấy người dùng" };

  const userIsVip = isVip(user);
  let withinFreeQuota = true;

  if (!userIsVip) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await prisma.wordLookup.count({
      where: { userId: session.user.id, createdAt: { gte: startOfDay } },
    });
    withinFreeQuota = todayCount < FREE_DAILY_LOOKUPS;

    if (!withinFreeQuota && user.coins <= 0) {
      return {
        error: `Bạn đã dùng hết ${FREE_DAILY_LOOKUPS} lượt tra từ miễn phí hôm nay và không còn coin. Nâng cấp VIP hoặc nạp thêm coin để tiếp tục.`,
      };
    }
  }

  let reply;
  try {
    reply = await translateText(trimmed);
  } catch {
    return { error: "Có lỗi khi dịch. Vui lòng thử lại." };
  }

  await prisma.wordLookup.create({ data: { userId: session.user.id } });

  let chargedCoins: number | undefined;
  if (!userIsVip && !withinFreeQuota) {
    chargedCoins = estimateMessageCostCoins(reply.inputTokens, reply.outputTokens);
    await prisma.user.update({ where: { id: session.user.id }, data: { coins: { decrement: chargedCoins } } });
  }

  return { translation: reply.text, chargedCoins };
}
