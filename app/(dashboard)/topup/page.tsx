import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { PackagePicker } from "./package-picker";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Đang chờ xác nhận",
  COMPLETED: "Đã cộng coins",
  CANCELLED: "Đã huỷ",
};

export default async function TopupPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, history] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { coins: true } }),
    prisma.coinTopup.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Coins className="h-6 w-6 text-accent" />
          <div>
            <h1 className="text-xl font-semibold">Nạp Coin</h1>
            <p className="text-sm text-muted">Số dư hiện tại: {user?.coins ?? 0} coins</p>
          </div>
        </div>
        <PackagePicker />
      </GlassCard>

      {history.length > 0 && (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {history.map((t) => (
            <Link
              key={t.id}
              href={`/topup/${t.id}`}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-foreground/5"
            >
              <div>
                <p className="font-medium">{t.coins} coins</p>
                <p className="text-xs text-muted">{t.reference}</p>
              </div>
              <span
                className={
                  t.status === "COMPLETED"
                    ? "text-emerald-500"
                    : t.status === "CANCELLED"
                      ? "text-red-500"
                      : "text-accent"
                }
              >
                {STATUS_LABEL[t.status]}
              </span>
            </Link>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
