"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { askAssistant, FREE_DAILY_AI_LIMIT, isAiConfigured } from "@/src/lib/ai";
import { isVip } from "@/src/lib/vip";
import { estimateMessageCostCoins } from "@/src/lib/ai-billing";

const messageSchema = z.object({
  content: z.string().trim().min(1, "Vui lòng nhập câu hỏi").max(4000, "Tối đa 4000 ký tự"),
});

export type SendMessageState = { error?: string; chargedCoins?: number };

export async function sendMessageAction(_prevState: SendMessageState, formData: FormData): Promise<SendMessageState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  if (!isAiConfigured()) return { error: "Trợ lý AI chưa được cấu hình. Vui lòng thêm ANTHROPIC_API_KEY." };

  const parsed = messageSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

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
    const todayCount = await prisma.aiMessage.count({
      where: { userId: session.user.id, role: "USER", createdAt: { gte: startOfDay } },
    });
    withinFreeQuota = todayCount < FREE_DAILY_AI_LIMIT;

    // Past the free quota, usage is billed per message from the coin
    // balance — block here rather than spend on a call the user can't pay for.
    if (!withinFreeQuota && user.coins <= 0) {
      return {
        error: `Bạn đã dùng hết ${FREE_DAILY_AI_LIMIT} câu hỏi miễn phí hôm nay và không còn coin. Nâng cấp VIP hoặc nạp thêm coin để tiếp tục.`,
      };
    }
  }

  const history = await prisma.aiMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  await prisma.aiMessage.create({
    data: { userId: session.user.id, role: "USER", content: parsed.data.content },
  });

  let reply: Awaited<ReturnType<typeof askAssistant>>;
  try {
    reply = await askAssistant([
      ...history.map((m) => ({ role: m.role.toLowerCase() as "user" | "assistant", content: m.content })),
      { role: "user", content: parsed.data.content },
    ]);
  } catch {
    return { error: "Có lỗi khi gọi trợ lý AI. Vui lòng thử lại." };
  }

  await prisma.aiMessage.create({
    data: { userId: session.user.id, role: "ASSISTANT", content: reply.text },
  });

  let chargedCoins: number | undefined;
  if (!userIsVip && !withinFreeQuota) {
    chargedCoins = estimateMessageCostCoins(reply.inputTokens, reply.outputTokens);
    await prisma.user.update({ where: { id: session.user.id }, data: { coins: { decrement: chargedCoins } } });
  }

  revalidatePath("/ai");
  return { chargedCoins };
}
