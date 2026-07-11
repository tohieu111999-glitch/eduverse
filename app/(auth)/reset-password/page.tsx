"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/src/components/ui/glass-card";
import { Button } from "@/src/components/ui/button";
import { resetPasswordAction } from "./actions";

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, action, pending] = useActionState(resetPasswordAction, {});

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-500">Link không hợp lệ.</p>
        <Link href="/forgot-password" className="mt-4 block text-sm text-primary hover:underline">
          Yêu cầu link mới
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h2 className="font-bold">Mật khẩu đã được đặt lại!</h2>
        <p className="mt-2 text-sm text-muted">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
        <Link href="/login" className="mt-4 block text-sm text-primary hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="mb-1 block text-sm font-medium">Mật khẩu mới</label>
        <input name="password" type="password" className={inputClass} placeholder="Ít nhất 6 ký tự" required minLength={6} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Xác nhận mật khẩu</label>
        <input name="confirm" type="password" className={inputClass} placeholder="Nhập lại mật khẩu" required />
      </div>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Đang lưu..." : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <GlassCard className="animate-slide-up p-8">
      <h1 className="mb-1 text-2xl font-semibold">Đặt lại mật khẩu</h1>
      <p className="mb-6 text-sm text-muted">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      <Suspense fallback={<p className="text-sm text-muted">Đang tải...</p>}>
        <ResetForm />
      </Suspense>
    </GlassCard>
  );
}
