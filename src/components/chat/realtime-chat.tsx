"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, FileText, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useSocket } from "@/src/components/realtime/socket-provider";
import { Button } from "@/src/components/ui/button";

export type ChatMessageItem = {
  id: string;
  content: string;
  type?: "TEXT" | "IMAGE" | "FILE";
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt: string | Date;
  author: { id: string; displayName: string | null; username: string | null; avatar: string | null };
};

export function RealtimeChat({
  roomType,
  roomId,
  initialMessages,
  currentUserId,
}: {
  roomType: "dm" | "channel";
  roomId: string;
  initialMessages: ChatMessageItem[];
  currentUserId: string;
}) {
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit(`${roomType}:join`, roomType === "dm" ? { conversationId: roomId } : { channelId: roomId });

    function handleMessage(message: ChatMessageItem) {
      setMessages((prev) => [...prev, message]);
    }
    socket.on(`${roomType}:message`, handleMessage);
    return () => {
      socket.off(`${roomType}:message`, handleMessage);
    };
  }, [socket, roomType, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(payload: { content?: string; type?: "TEXT" | "IMAGE" | "FILE"; attachmentUrl?: string; attachmentName?: string }) {
    if (!socket) return;
    socket.emit(
      `${roomType}:send`,
      roomType === "dm" ? { conversationId: roomId, ...payload } : { channelId: roomId, ...payload },
    );
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    send({ content: input });
    setInput("");
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Không thể tải lên tệp");
        return;
      }
      send({ type: data.type, attachmentUrl: data.url, attachmentName: data.name });
    } catch {
      toast.error("Không thể tải lên tệp");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && <p className="py-12 text-center text-sm text-muted">Chưa có tin nhắn nào.</p>}
        {messages.map((m) => {
          const name = m.author.displayName ?? m.author.username ?? "Người dùng";
          const isMine = m.author.id === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine ? "gradient-cyber text-white" : "bg-foreground/5"
                }`}
              >
                {!isMine && <p className="mb-0.5 text-xs font-medium text-accent">{name}</p>}

                {m.type === "IMAGE" && m.attachmentUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.attachmentUrl}
                    alt={m.attachmentName ?? "Hình ảnh"}
                    className="mb-1 max-h-64 rounded-xl object-cover"
                  />
                )}
                {m.type === "FILE" && m.attachmentUrl && (
                  <a
                    href={m.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={m.attachmentName ?? undefined}
                    className="mb-1 flex items-center gap-2 rounded-xl bg-foreground/10 px-3 py-2 text-xs hover:bg-foreground/20"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{m.attachmentName}</span>
                    <Download className="h-3.5 w-3.5 shrink-0" />
                  </a>
                )}

                {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-foreground/10 p-4">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !socket}
          className="flex shrink-0 items-center justify-center rounded-full px-3 text-muted transition hover:bg-foreground/5 disabled:opacity-50"
          aria-label="Gửi tệp đính kèm"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={uploading ? "Đang tải lên..." : "Nhập tin nhắn..."}
          maxLength={2000}
          disabled={uploading}
          className="flex-1 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" disabled={!socket || uploading}>
          Gửi
        </Button>
      </form>
    </div>
  );
}
