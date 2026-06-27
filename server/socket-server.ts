import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { verifyRealtimeToken } from "../src/lib/realtime-token";

type ChatSendPayload = {
  content?: string;
  type?: "TEXT" | "IMAGE" | "FILE";
  attachmentUrl?: string;
  attachmentName?: string;
};

const prisma = new PrismaClient();
const PORT = Number(process.env.SOCKET_PORT ?? 3001);
const ALLOWED_ORIGIN = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGIN, credentials: true },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string") return next(new Error("Unauthorized"));
  const userId = verifyRealtimeToken(token);
  if (!userId) return next(new Error("Unauthorized"));
  socket.data.userId = userId;
  next();
});

async function sharesConversation(conversationId: string, userIdA: string, userIdB: string) {
  const [a, b] = await Promise.all([
    prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId: userIdA } } }),
    prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId: userIdB } } }),
  ]);
  return Boolean(a && b);
}

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  // Lets call signaling target a user directly regardless of which page
  // they're on, instead of only reaching them inside a joined dm/channel room.
  socket.join(`user:${userId}`);

  socket.on(
    "call:invite",
    async (payload: { toUserId: string; conversationId: string; callType: "audio" | "video"; offer: unknown }) => {
      const { toUserId, conversationId, callType, offer } = payload;
      if (!(await sharesConversation(conversationId, userId, toUserId))) return;

      const caller = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, displayName: true, username: true, avatar: true },
      });
      io.to(`user:${toUserId}`).emit("call:incoming", { from: caller, conversationId, callType, offer });
    },
  );

  socket.on("call:answer", (payload: { toUserId: string; conversationId: string; answer: unknown }) => {
    io.to(`user:${payload.toUserId}`).emit("call:answered", { conversationId: payload.conversationId, answer: payload.answer });
  });

  socket.on("call:ice-candidate", (payload: { toUserId: string; candidate: unknown }) => {
    io.to(`user:${payload.toUserId}`).emit("call:ice-candidate", { candidate: payload.candidate });
  });

  socket.on("call:reject", (payload: { toUserId: string; conversationId: string }) => {
    io.to(`user:${payload.toUserId}`).emit("call:rejected", { conversationId: payload.conversationId });
  });

  socket.on("call:end", (payload: { toUserId: string; conversationId: string }) => {
    io.to(`user:${payload.toUserId}`).emit("call:ended", { conversationId: payload.conversationId });
  });

  socket.on("dm:join", async ({ conversationId }: { conversationId: string }) => {
    const member = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member) return;
    socket.join(`dm:${conversationId}`);
  });

  socket.on("dm:send", async (payload: ChatSendPayload & { conversationId: string }) => {
    const { conversationId } = payload;
    const content = payload.content?.trim() ?? "";
    if (!content && !payload.attachmentUrl) return;

    const member = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member) return;

    const message = await prisma.message.create({
      data: {
        content: content.slice(0, 2000),
        type: payload.type ?? "TEXT",
        attachmentUrl: payload.attachmentUrl,
        attachmentName: payload.attachmentName,
        senderId: userId,
        conversationId,
      },
      include: { sender: { select: { id: true, displayName: true, username: true, avatar: true } } },
    });
    // Normalized to `author` so the client chat UI is identical for DMs and channels.
    const { sender, ...rest } = message;
    io.to(`dm:${conversationId}`).emit("dm:message", { ...rest, author: sender });
  });

  socket.on("channel:join", async ({ channelId }: { channelId: string }) => {
    const channel = await prisma.channel.findUnique({ where: { id: channelId }, select: { serverId: true } });
    if (!channel) return;
    const member = await prisma.serverMember.findUnique({
      where: { serverId_userId: { serverId: channel.serverId, userId } },
    });
    if (!member) return;
    socket.join(`channel:${channelId}`);
  });

  socket.on("channel:send", async (payload: ChatSendPayload & { channelId: string }) => {
    const { channelId } = payload;
    const content = payload.content?.trim() ?? "";
    if (!content && !payload.attachmentUrl) return;

    const channel = await prisma.channel.findUnique({ where: { id: channelId }, select: { serverId: true } });
    if (!channel) return;
    const member = await prisma.serverMember.findUnique({
      where: { serverId_userId: { serverId: channel.serverId, userId } },
    });
    if (!member) return;

    const message = await prisma.channelMessage.create({
      data: {
        content: content.slice(0, 2000),
        type: payload.type ?? "TEXT",
        attachmentUrl: payload.attachmentUrl,
        attachmentName: payload.attachmentName,
        authorId: userId,
        channelId,
      },
      include: { author: { select: { id: true, displayName: true, username: true, avatar: true } } },
    });
    io.to(`channel:${channelId}`).emit("channel:message", message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on :${PORT}`);
});
