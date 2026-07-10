import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, Crown, X } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { isVip, buildVipPackages, DEFAULT_VIP_CONFIG } from "@/src/lib/vip";
import { GlassCard } from "@/src/components/ui/glass-card";
import { VipCarousel } from "./vip-carousel";
import { VipPackagePicker } from "./package-picker";

const COMPARE_ROWS = [
  { label: "Lượt AI/ngày", free: "20 lượt", vip: "Không giới hạn" },
  { label: "Lượt dịch/ngày", free: "20 lượt", vip: "Không giới hạn" },
  { label: "Số deck tối đa", free: "5 deck", vip: "Không giới hạn" },
  { label: "Quảng cáo", free: true, vip: false },   // true = has ads (bad), false = no ads (good)
  { label: "Huy hiệu VIP", free: false, vip: true }, // true = has it (good), false = no (neutral)
] as const;

export default async function VipPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, vipConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true, vipLevel: true, vipExpiresAt: true, displayName: true },
    }),
    prisma.vipConfig.findFirst(),
  ]);
  if (!user) redirect("/login");

  const active = isVip(user);
  const config = vipConfig ?? DEFAULT_VIP_CONFIG;
  const packages = buildVipPackages(config);
  const isLifetimeVip = active && user.vipExpiresAt && user.vipExpiresAt.getFullYear() >= 2090;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* ── Carousel ───────────────────────────────────────── */}
      <VipCarousel />

      {/* ── Active VIP status ──────────────────────────────── */}
      {active && (
        <GlassCard className="flex items-center justify-between border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-400">
                {user.vipLevel === "VIP_PLUS" ? "VIP+" : "VIP"} đang hoạt động
              </p>
              <p className="text-xs text-muted">
                {isLifetimeVip
                  ? "Trọn đời — không hết hạn"
                  : `Hết hạn: ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(user.vipExpiresAt!)}`}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
            Đang dùng
          </span>
        </GlassCard>
      )}

      {/* ── Comparison table ───────────────────────────────── */}
      <GlassCard className="overflow-hidden p-0">
        <div className="grid grid-cols-3 border-b border-foreground/10">
          <div className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Tính năng</div>
          <div className="border-l border-foreground/10 px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">Free</div>
          <div className="relative border-l border-foreground/10 bg-amber-500/8 px-4 py-3 text-center">
            <span className="flex items-center justify-center gap-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Crown className="h-3 w-3" /> VIP
            </span>
          </div>
        </div>

        {COMPARE_ROWS.map((row, i) => {
          const isLast = i === COMPARE_ROWS.length - 1;
          const isBool = typeof row.free === "boolean";
          return (
            <div
              key={row.label}
              className={`grid grid-cols-3 ${!isLast ? "border-b border-foreground/8" : ""}`}
            >
              <div className="px-4 py-3 text-sm">{row.label}</div>
              <div className="border-l border-foreground/8 px-4 py-3 text-center text-sm text-muted">
                {isBool ? (
                  row.label === "Quảng cáo" ? (
                    row.free ? <span className="text-red-400 text-xs">Có</span> : <Check className="mx-auto h-4 w-4 text-green-400" />
                  ) : (
                    row.free ? <Check className="mx-auto h-4 w-4 text-green-400" /> : <X className="mx-auto h-4 w-4 text-muted/50" />
                  )
                ) : row.free}
              </div>
              <div className="border-l border-foreground/8 bg-amber-500/5 px-4 py-3 text-center text-sm text-amber-300 font-medium">
                {isBool ? (
                  row.label === "Quảng cáo" ? (
                    row.vip ? <span className="text-red-400 text-xs">Có</span> : <span className="text-green-400 text-xs font-semibold">Không</span>
                  ) : (
                    row.vip ? <Check className="mx-auto h-4 w-4 text-amber-400" /> : <X className="mx-auto h-4 w-4 text-muted/50" />
                  )
                ) : row.vip}
              </div>
            </div>
          );
        })}
      </GlassCard>

      {/* ── Packages ───────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold">Chọn gói VIP</h2>
          <span className="ml-auto text-xs text-muted">Số dư: <span className="font-semibold text-foreground">{user.coins.toLocaleString("vi-VN")} coins</span></span>
        </div>

        <VipPackagePicker packages={packages} userCoins={user.coins} isVip={active} />
      </div>

      {/* ── Topup link ─────────────────────────────────────── */}
      <p className="text-center text-xs text-muted">
        Chưa đủ coins?{" "}
        <Link href="/topup" className="font-medium text-primary hover:underline">
          Nạp thêm coins →
        </Link>
      </p>

      {/* ── Policy ─────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted">
        Khi mua, bạn đồng ý với{" "}
        <Link href="/policy" className="hover:underline">Chính sách & Điều khoản</Link>
        {" "}của EduVerse.
      </p>
    </div>
  );
}
