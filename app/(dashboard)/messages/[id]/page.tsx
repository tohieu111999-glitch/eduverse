import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { RealtimeChat } from "@/src/components/chat/realtime-chat";
import { CallButtons } from "./call-buttons";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: { include: { user: { select: { id: true, displayName: true, username: true, avatar: true } } } },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100,
        include: { sender: { select: { id: true, displayName: true, username: true, avatar: true } } },
      },
    },
  });

  if (!conversation) notFound();
  const isParticipant = conversation.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant) notFound();

  const other = conversation.participants.find((p) => p.userId !== session.user.id)?.user;
  const name = other?.displayName ?? other?.username ?? "Người dùng";

  const initialMessages = conversation.messages.map((m) => ({
    id: m.id,
    content: m.content,
    type: m.type,
    attachmentUrl: m.attachmentUrl,
    attachmentName: m.attachmentName,
    createdAt: m.createdAt,
    author: m.sender,
  }));

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/messages" className="rounded-full p-1.5 hover:bg-foreground/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{name}</h1>
        {other && <CallButtons peerId={other.id} peerName={name} conversationId={conversation.id} />}
      </div>

      <div className="glass flex flex-1 flex-col overflow-hidden rounded-2xl">
        <RealtimeChat
          roomType="dm"
          roomId={conversation.id}
          initialMessages={initialMessages}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
