import { redirect } from "next/navigation";
import Link from "next/link";
import { Crown, Sparkles, Upload, Zap } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { isVip } from "@/src/lib/vip";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { VipPackagePicker } from "./package-picker";

const PERKS = [
  { icon: Sparkles, text: "Trợ lý AI không giới hạn" },
  { icon: Zap, text: "Không quảng cáo, tải nhanh hơn" },
  { icon: Upload, text: "Giới hạn upload lớn hơn" },
  { icon: Crown, text: "Huy hiệu VIP trên trang cá nhân" },
];

export default async function VipPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coins: true, vipLevel: true, vipExpiresAt: true },
  });
  if (!user) redirect("/login");

  const active = isVip(user);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Crown className="h-6 w-6 text-accent" />
          <div>
            <h1 className="text-xl font-semibold">EduVerse VIP</h1>
            <p className="text-sm text-muted">Số dư hiện tại: {user.coins} coins</p>
          </div>
        </div>

        {active && user.vipExpiresAt && (
          <div className="mb-5 rounded-xl bg-accent/10 p-4 text-sm">
            Bạn đang là <span className="font-semibold text-accent">VIP</span> đến hết{" "}
            {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(user.vipExpiresAt)}
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-3">
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 rounded-xl bg-foreground/5 p-3 text-sm">
              <Icon className="h-4 w-4 shrink-0 text-accent" />
              {text}
            </div>
          ))}
        </div>

        <VipPackagePicker />

        <p className="mt-4 text-center text-xs text-muted">
          Chưa đủ coins?{" "}
          <Link href="/topup" className={buttonVariants("ghost", "px-2 py-1")}>
            Nạp thêm coins
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
