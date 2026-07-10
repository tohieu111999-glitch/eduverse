"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles } from "lucide-react";

type Msg = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  pending?: boolean;
  error?: boolean;
};

function TypingDots() {
  return (
    <span className="flex items-center gap-1 h-4 px-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "160ms" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "320ms" }} />
    </span>
  );
}

export function ChatClient({ initialMessages }: { initialMessages: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const content = input.trim();
    if (!content) return;

    const userMsgId = `u-${Date.now()}`;
    const typingId = `t-${Date.now()}`;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "USER", content },
      { id: typingId, role: "ASSISTANT", content: "", pending: true },
    ]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json() as { reply?: string; error?: string; chargedCoins?: number };

      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                content: data.error ?? data.reply ?? "Có lỗi xảy ra.",
                pending: false,
                error: !res.ok,
              }
            : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? { ...m, content: "Mất kết nối. Vui lòng thử lại.", pending: false, error: true }
            : m,
        ),
      );
    }
  }, [input]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Xin chào! Mình là trợ lý AI EduVerse</p>
              <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-xs mx-auto">
                Hỏi mình bất cứ điều gì: giải bài tập, dịch thuật, tóm tắt tài liệu, luyện từ vựng...
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {["Dịch 'xin chào' sang tiếng Trung", "Giải thích ngữ pháp HSK 2", "Tóm tắt bài học hôm nay"].map(
                (hint) => (
                  <button
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-xs text-muted transition hover:border-primary/40 hover:text-primary"
                  >
                    {hint}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${msg.role === "USER" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ASSISTANT" && (
                <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === "USER"
                    ? "gradient-cyber rounded-br-sm text-white"
                    : msg.error
                      ? "rounded-bl-sm bg-red-500/10 text-red-400"
                      : "rounded-bl-sm bg-foreground/5"
                }`}
              >
                {msg.pending ? <TypingDots /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-foreground/8 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-foreground/10 bg-foreground/4 px-3 py-2 focus-within:border-primary transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={4000}
            placeholder="Nhắn tin... (Enter gửi · Shift+Enter xuống dòng)"
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted"
            style={{ minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            aria-label="Gửi"
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted/60">
          AI có thể mắc lỗi. Kiểm tra thông tin quan trọng trước khi sử dụng.
        </p>
      </div>
    </div>
  );
}
