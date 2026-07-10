import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { askAssistant, FREE_DAILY_AI_LIMIT, isAiConfigured } from "@/src/lib/ai";
import { isVip } from "@/src/lib/vip";
import { estimateMessageCostCoins } from "@/src/lib/ai-billing";

const bodySchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });

  if (!isAiConfigured())
    return NextResponse.json({ error: "Trợ lý AI chưa được cấu hình." }, { status: 503 });

  let content: string;
  try {
    ({ content } = bodySchema.parse(await req.json()));
  } catch {
    return NextResponse.json({ error: "Tin nhắn không hợp lệ" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { vipLevel: true, vipExpiresAt: true, coins: true },
  });
  if (!user) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });

  const userIsVip = isVip(user);
  let withinFreeQuota = true;

  if (!userIsVip) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await prisma.aiMessage.count({
      where: { userId: session.user.id, role: "USER", createdAt: { gte: startOfDay } },
    });
    withinFreeQuota = todayCount < FREE_DAILY_AI_LIMIT;

    if (!withinFreeQuota && user.coins <= 0) {
      return NextResponse.json(
        { error: `Đã hết ${FREE_DAILY_AI_LIMIT} câu hỏi miễn phí hôm nay và không còn coin. Nâng cấp VIP hoặc nạp thêm coin.` },
        { status: 402 },
      );
    }
  }

  const history = await prisma.aiMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
    take: 40,
  });

  await prisma.aiMessage.create({
    data: { userId: session.user.id, role: "USER", content },
  });

  let reply: Awaited<ReturnType<typeof askAssistant>>;
  try {
    reply = await askAssistant([
      ...history.map((m) => ({ role: m.role.toLowerCase() as "user" | "assistant", content: m.content })),
      { role: "user", content },
    ]);
  } catch {
    return NextResponse.json({ error: "Có lỗi khi gọi trợ lý AI. Vui lòng thử lại." }, { status: 500 });
  }

  await prisma.aiMessage.create({
    data: { userId: session.user.id, role: "ASSISTANT", content: reply.text },
  });

  let chargedCoins: number | undefined;
  if (!userIsVip && !withinFreeQuota) {
    chargedCoins = estimateMessageCostCoins(reply.inputTokens, reply.outputTokens);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { coins: { decrement: chargedCoins } },
    });
  }

  return NextResponse.json({ reply: reply.text, chargedCoins });
}
