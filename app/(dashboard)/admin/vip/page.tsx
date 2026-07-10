import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_VIP_CONFIG } from "@/src/lib/vip";
import { GlassCard } from "@/src/components/ui/glass-card";
import { VipConfigForm } from "./vip-config-form";

export default async function AdminVipPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const config = await prisma.vipConfig.findFirst() ?? DEFAULT_VIP_CONFIG;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted transition hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Crown className="h-5 w-5 text-amber-400" />
        <h1 className="text-lg font-semibold">Cấu hình giá VIP</h1>
      </div>

      <GlassCard className="p-6">
        <p className="mb-5 text-sm text-muted">
          Thay đổi giá sẽ có hiệu lực ngay lập tức trên trang /vip. Đơn vị: coins.
        </p>
        <VipConfigForm defaultValues={config} />
      </GlassCard>

      <GlassCard className="p-5 space-y-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Công thức gợi ý</p>
        <p className="text-sm">1 năm = 1 tháng × 12 × 60% (tiết kiệm 40%)</p>
        <p className="text-sm text-muted">Ví dụ: tháng 600 → năm 4320 → trọn đời 9999</p>
      </GlassCard>
    </div>
  );
}
