import Link from "next/link";
import { RegisterForm } from "./register-form";
import { GlassCard } from "@/src/components/ui/glass-card";

export default function RegisterPage() {
  const oauth = {
    google: Boolean(process.env.AUTH_GOOGLE_ID),
    discord: Boolean(process.env.AUTH_DISCORD_ID),
    facebook: Boolean(process.env.AUTH_FACEBOOK_ID),
  };

  return (
    <GlassCard className="animate-slide-up p-8">
      <h1 className="text-2xl font-semibold">Tạo tài khoản EduVerse</h1>
      <p className="mt-1 text-sm text-muted">Học tập, kết nối và kiếm tiền từ tri thức.</p>

      <RegisterForm oauth={oauth} />

      <p className="mt-6 text-center text-sm text-muted">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </GlassCard>
  );
}
