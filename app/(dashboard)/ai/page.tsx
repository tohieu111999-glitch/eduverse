import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { FREE_DAILY_AI_LIMIT, isAiConfigured } from "@/src/lib/ai";
import { isVip } from "@/src/lib/vip";
import { GlassCard } from "@/src/components/ui/glass-card";
import { ChatClient } from "./chat-client";

export default async function AiAssistantPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const configured = isAiConfigured();

  const messages = configured
    ? await prisma.aiMessage.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        take: 100,
        select: { id: true, role: true, content: true },
      })
    : [];

  const user = configured
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { vipLevel: true, vipExpiresAt: true, coins: true },
      })
    : null;

  let quotaLabel: string | null = null;
  if (user) {
    if (isVip(user)) {
      quotaLabel = "VIP · không giới hạn";
    } else {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayCount = await prisma.aiMessage.count({
        where: { userId: session.user.id, role: "USER", createdAt: { gte: startOfDay } },
      });
      quotaLabel =
        todayCount < FREE_DAILY_AI_LIMIT
          ? `${todayCount}/${FREE_DAILY_AI_LIMIT} câu hỏi miễn phí`
          : `Đã hết miễn phí · coin: ${user.coins}`;
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h1 className="text-lg font-semibold">Trợ lý AI</h1>
        </div>
        {quotaLabel && (
          <span className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-muted">
            {quotaLabel}
          </span>
        )}
      </div>

      <GlassCard className="flex flex-1 flex-col overflow-hidden p-0">
        {!configured ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <Sparkles className="h-10 w-10 text-muted/40" />
            <p className="text-sm text-muted">
              Trợ lý AI chưa được cấu hình.
              <br />
              Thêm <code className="rounded bg-foreground/8 px-1.5 py-0.5 text-xs">ANTHROPIC_API_KEY</code> vào file .env.
            </p>
          </div>
        ) : (
          <ChatClient
            initialMessages={messages.map((m) => ({
              id: m.id,
              role: m.role as "USER" | "ASSISTANT",
              content: m.content,
            }))}
          />
        )}
      </GlassCard>
    </div>
  );
}
