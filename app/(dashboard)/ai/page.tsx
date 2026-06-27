import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { FREE_DAILY_AI_LIMIT, isAiConfigured } from "@/src/lib/ai";
import { isVip } from "@/src/lib/vip";
import { GlassCard } from "@/src/components/ui/glass-card";
import { ChatForm } from "./chat-form";

export default async function AiAssistantPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const configured = isAiConfigured();
  const messages = configured
    ? await prisma.aiMessage.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        take: 100,
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
      quotaLabel = "VIP · không giới hạn câu hỏi";
    } else {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayCount = await prisma.aiMessage.count({
        where: { userId: session.user.id, role: "USER", createdAt: { gte: startOfDay } },
      });
      quotaLabel =
        todayCount < FREE_DAILY_AI_LIMIT
          ? `${todayCount}/${FREE_DAILY_AI_LIMIT} câu hỏi miễn phí hôm nay`
          : `Đã hết miễn phí · trả bằng coin (${user.coins} coin)`;
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Trợ lý AI</h1>
        </div>
        {quotaLabel && <span className="text-xs text-muted">{quotaLabel}</span>}
      </div>

      <GlassCard className="flex flex-1 flex-col overflow-hidden p-0">
        {!configured ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <p className="text-sm text-muted">
              Trợ lý AI chưa được cấu hình. Quản trị viên cần thêm <code>ANTHROPIC_API_KEY</code> vào file .env.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">
                  Hỏi mình bất cứ điều gì về bài tập, dịch thuật, tóm tắt tài liệu...
                </p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        m.role === "USER" ? "gradient-cyber text-white" : "bg-foreground/5"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            <ChatForm />
          </>
        )}
      </GlassCard>
    </div>
  );
}
