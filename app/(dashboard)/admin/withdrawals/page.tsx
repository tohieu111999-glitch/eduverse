import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Banknote } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { WithdrawalModerationActions } from "./moderation-actions";

export default async function AdminWithdrawalsPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const pending = await prisma.withdrawal.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { displayName: true, username: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Banknote className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Duyệt yêu cầu rút coin</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quản trị
        </Link>
      </div>

      {pending.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Không có yêu cầu rút coin nào đang chờ duyệt.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((w) => (
            <GlassCard key={w.id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {w.coins} coins · {w.amountVnd.toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-xs text-muted">
                    {w.user.displayName ?? w.user.username} · {w.user.email}
                  </p>
                  <p className="mt-1 text-sm">
                    Chuyển đến: <span className="font-medium">{w.bankAccountName}</span> · {w.bankName} ·{" "}
                    <span className="font-mono">{w.bankAccountNumber}</span>
                  </p>
                </div>
                <WithdrawalModerationActions withdrawalId={w.id} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
