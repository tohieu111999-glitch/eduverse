import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Coins } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { TopupModerationActions } from "./moderation-actions";

export default async function AdminTopupsPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const pending = await prisma.coinTopup.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { displayName: true, username: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coins className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Duyệt yêu cầu nạp coin</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quản trị
        </Link>
      </div>

      {pending.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Không có yêu cầu nạp coin nào đang chờ duyệt.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((t) => (
            <GlassCard key={t.id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {t.coins} coins · {t.amount.toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-xs text-muted">
                    {t.user.displayName ?? t.user.username} · {t.user.email}
                  </p>
                  <p className="mt-1 font-mono text-sm text-accent">{t.reference}</p>
                </div>
                <TopupModerationActions topupId={t.id} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
