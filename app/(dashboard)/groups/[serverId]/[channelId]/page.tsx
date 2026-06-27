import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Hash } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { cn } from "@/src/lib/utils";
import { RealtimeChat } from "@/src/components/chat/realtime-chat";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) {
  const { serverId, channelId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: {
      channels: { orderBy: { createdAt: "asc" } },
      members: { where: { userId: session.user.id }, select: { id: true } },
    },
  });

  if (!server) notFound();
  if (server.members.length === 0) notFound();

  const channel = server.channels.find((c) => c.id === channelId);
  if (!channel) notFound();

  const messages = await prisma.channelMessage.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { author: { select: { id: true, displayName: true, username: true, avatar: true } } },
  });

  const initialMessages = messages.map((m) => ({
    id: m.id,
    content: m.content,
    type: m.type,
    attachmentUrl: m.attachmentUrl,
    attachmentName: m.attachmentName,
    createdAt: m.createdAt,
    author: m.author,
  }));

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl gap-4">
      <aside className="hidden w-48 shrink-0 flex-col gap-1 rounded-2xl bg-foreground/5 p-3 sm:flex">
        <h2 className="mb-2 truncate px-2 text-sm font-semibold">{server.name}</h2>
        {server.channels.map((c) => (
          <Link
            key={c.id}
            href={`/groups/${serverId}/${c.id}`}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition",
              c.id === channelId ? "glass text-foreground" : "text-muted hover:bg-foreground/5",
            )}
          >
            <Hash className="h-3.5 w-3.5" />
            {c.name}
          </Link>
        ))}
      </aside>

      <div className="glass flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-foreground/10 px-4 py-3">
          <Hash className="h-4 w-4 text-muted" />
          <h1 className="text-sm font-semibold">{channel.name}</h1>
        </div>
        <RealtimeChat
          roomType="channel"
          roomId={channel.id}
          initialMessages={initialMessages}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
