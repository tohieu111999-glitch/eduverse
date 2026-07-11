"use client";

import { useActionState } from "react";
import Link from "next/link";
import { GlassCard } from "@/src/components/ui/glass-card";
import { Button } from "@/src/components/ui/button";
import { forgotPasswordAction } from "./actions";

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {});

  if (state.success) {
    return (
      <GlassCard className="animate-slide-up p-8 text-center">
        <div className="mb-4 text-4xl">📬</div>
        <h1 className="text-xl font-bold">Kiểm tra email của bạn</h1>
        <p className="mt-2 text-sm text-muted">
          Chúng tôi đã gửi link đặt lại mật khẩu. Kiểm tra cả hộp thư Spam nếu không thấy.
        </p>
        <Link href="/login" className="mt-6 block text-sm text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="animate-slide-up p-8">
      <h1 className="text-2xl font-semibold">Quên mật khẩu?</h1>
      <p className="mt-1 text-sm text-muted">Nhập email — chúng tôi sẽ gửi link đặt lại.</p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input name="email" type="email" className={inputClass} placeholder="ban@email.com" required />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang gửi..." : "Gửi link đặt lại"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </GlassCard>
  );
}
