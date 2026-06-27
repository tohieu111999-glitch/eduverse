import Link from "next/link";
import { LoginForm } from "./login-form";
import { GlassCard } from "@/src/components/ui/glass-card";

export default function LoginPage() {
  const oauth = {
    google: Boolean(process.env.AUTH_GOOGLE_ID),
    discord: Boolean(process.env.AUTH_DISCORD_ID),
    facebook: Boolean(process.env.AUTH_FACEBOOK_ID),
  };

  return (
    <GlassCard className="animate-slide-up p-8">
      <h1 className="text-2xl font-semibold">Chào mừng trở lại</h1>
      <p className="mt-1 text-sm text-muted">Đăng nhập để tiếp tục hành trình học tập của bạn.</p>

      <LoginForm oauth={oauth} />

      <p className="mt-6 text-center text-sm text-muted">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </GlassCard>
  );
}
