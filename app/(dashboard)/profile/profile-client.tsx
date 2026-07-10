"use client";

import { useActionState, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Check, ChevronDown, ChevronUp, Copy, LogOut, MessageSquare, Star } from "lucide-react";
import toast from "react-hot-toast";
import { submitFeedbackAction, type FeedbackState } from "./profile-actions";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";

const initialFeedback: FeedbackState = {};

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.origin : "https://eduverse.app";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Đã copy link EduVerse!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center gap-3 px-2 py-3 text-sm transition hover:bg-foreground/5 rounded-xl"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </span>
      <div className="flex-1 text-left">
        <p className="font-medium">Chia sẻ ứng dụng</p>
        <p className="text-xs text-muted">Copy link EduVerse cho bạn bè</p>
      </div>
    </button>
  );
}

export function FeedbackSection() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: FeedbackState, fd: FormData) => {
      const result = await submitFeedbackAction(prev, fd);
      if (result.success) {
        formRef.current?.reset();
        setOpen(false);
        toast.success("Cảm ơn bạn đã góp ý! ❤️");
      }
      return result;
    },
    initialFeedback,
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-2 py-3 text-sm transition hover:bg-foreground/5 rounded-xl"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
          <MessageSquare className="h-4 w-4" />
        </span>
        <div className="flex-1 text-left">
          <p className="font-medium">Góp ý</p>
          <p className="text-xs text-muted">Giúp chúng mình cải thiện EduVerse</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
      </button>

      {open && (
        <form ref={formRef} action={formAction} className="mt-2 space-y-3 px-2 pb-3">
          <textarea
            name="content"
            rows={4}
            maxLength={2000}
            autoFocus
            placeholder="Bạn muốn góp ý điều gì về EduVerse?"
            className="w-full resize-none rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:border-primary"
            required
          />
          {state.error && <p className="text-xs text-red-500">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-foreground/10 px-4 py-2 text-sm text-muted transition hover:bg-foreground/8"
            >
              Huỷ
            </button>
            <Button type="submit" disabled={pending}>
              {pending ? "Đang gửi..." : "Gửi góp ý"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function RateButton() {
  function handleRate() {
    toast("Cảm ơn bạn đã yêu thích EduVerse! ⭐⭐⭐⭐⭐", { duration: 3000 });
  }

  return (
    <button
      type="button"
      onClick={handleRate}
      className="flex w-full items-center gap-3 px-2 py-3 text-sm transition hover:bg-foreground/5 rounded-xl"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
        <Star className="h-4 w-4" />
      </span>
      <div className="flex-1 text-left">
        <p className="font-medium">Đánh giá</p>
        <p className="text-xs text-muted">Cho chúng mình biết bạn cảm thấy thế nào</p>
      </div>
    </button>
  );
}

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex w-full items-center gap-3 px-2 py-3 text-sm text-red-400 transition hover:bg-red-500/5 rounded-xl"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15">
        <LogOut className="h-4 w-4" />
      </span>
      <div className="flex-1 text-left">
        <p className="font-medium">Đăng xuất</p>
        <p className="text-xs text-red-400/70">Đăng xuất khỏi tài khoản này</p>
      </div>
    </button>
  );
}

export function SupportCard({ children }: { children: React.ReactNode }) {
  return <GlassCard className="px-2 py-1 divide-y divide-foreground/8">{children}</GlassCard>;
}
