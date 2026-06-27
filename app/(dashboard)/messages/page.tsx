import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      participants: { include: { user: { select: { id: true, displayName: true, username: true, avatar: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const sorted = conversations
    .map((c) => ({
      ...c,
      lastActivity: c.messages[0]?.createdAt ?? c.createdAt,
      other: c.participants.find((p) => p.userId !== session.user.id)?.user,
    }))
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-accent" />
        <h1 className="text-xl font-semibold">Tin nhắn</h1>
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          Chưa có cuộc trò chuyện nào. Nhắn tin cho ai đó từ trang cá nhân của họ.
        </p>
      ) : (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {sorted.map((c) => {
            if (!c.other) return null;
            const name = c.other.displayName ?? c.other.username ?? "Người dùng";
            const lastMessage = c.messages[0];
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-3 px-3 py-3 transition hover:bg-foreground/5"
              >
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full gradient-cyber text-sm font-semibold text-white">
                  {c.other.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.other.avatar} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="truncate text-xs text-muted">{lastMessage?.content ?? "Chưa có tin nhắn"}</p>
                </div>
              </Link>
            );
          })}
        </GlassCard>
      )}
    </div>
  );
}
