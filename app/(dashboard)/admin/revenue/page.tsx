import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";

function startOf(unit: "day" | "week" | "month"): Date {
  const now = new Date();
  if (unit === "day") return new Date(now.setHours(0, 0, 0, 0));
  if (unit === "week") {
    const d = new Date(now.setHours(0, 0, 0, 0));
    const diff = (d.getDay() + 6) % 7; // Monday-start week
    d.setDate(d.getDate() - diff);
    return d;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default async function RevenuePage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const [today, week, month, allTime, commission, vipRevenue, withdrawn, recentTopups] = await Promise.all([
    prisma.coinTopup.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED", createdAt: { gte: startOf("day") } } }),
    prisma.coinTopup.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED", createdAt: { gte: startOf("week") } } }),
    prisma.coinTopup.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED", createdAt: { gte: startOf("month") } } }),
    prisma.coinTopup.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.order.aggregate({ _sum: { commission: true }, where: { status: "COMPLETED" } }),
    prisma.vipPurchase.aggregate({ _sum: { coinsSpent: true } }),
    prisma.withdrawal.aggregate({ _sum: { amountVnd: true }, where: { status: "COMPLETED" } }),
    prisma.coinTopup.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { username: true, displayName: true } } },
    }),
  ]);

  const vnd = (n: number | null) => `${(n ?? 0).toLocaleString("vi-VN")}đ`;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <h1 className="text-xl font-semibold">Doanh thu</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quản trị
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-5">
          <p className="text-xs text-muted">Hôm nay</p>
          <p className="mt-1 text-2xl font-bold text-emerald-500">{vnd(today._sum.amount)}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-muted">Tuần này</p>
          <p className="mt-1 text-2xl font-bold">{vnd(week._sum.amount)}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-muted">Tháng này</p>
          <p className="mt-1 text-2xl font-bold">{vnd(month._sum.amount)}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-muted">Tổng từ trước đến nay</p>
          <p className="mt-1 text-2xl font-bold">{vnd(allTime._sum.amount)}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <p className="text-sm font-medium text-muted">Doanh thu nội bộ (coin)</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted">Hoa hồng chợ tài liệu</p>
            <p className="text-lg font-semibold">{commission._sum.commission ?? 0} coin</p>
          </div>
          <div>
            <p className="text-xs text-muted">Doanh thu VIP</p>
            <p className="text-lg font-semibold">{vipRevenue._sum.coinsSpent ?? 0} coin</p>
          </div>
        </div>
        <div className="mt-4 border-t border-foreground/10 pt-4">
          <p className="text-xs text-muted">Đã chuyển khoản cho người bán rút coin</p>
          <p className="text-lg font-semibold text-red-400">-{vnd(withdrawn._sum.amountVnd)}</p>
        </div>
      </GlassCard>

      <GlassCard className="divide-y divide-foreground/10 p-2">
        <h2 className="px-2 py-2 text-sm font-medium text-muted">Giao dịch nạp coin gần đây</h2>
        {recentTopups.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted">Chưa có giao dịch nào.</p>
        ) : (
          recentTopups.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-2 py-3 text-sm">
              <div>
                <p className="font-medium">{t.user.displayName ?? t.user.username}</p>
                <p className="text-xs text-muted">
                  {t.coins} coin · {t.reference}
                </p>
              </div>
              <p className="font-semibold text-emerald-500">{vnd(t.amount)}</p>
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}
