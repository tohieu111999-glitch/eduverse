import { redirect } from "next/navigation";
import { Banknote } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { WithdrawForm } from "./withdraw-form";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Đang chờ admin chuyển khoản",
  COMPLETED: "Đã chuyển khoản",
  REJECTED: "Đã từ chối (hoàn coin)",
};

export default async function WithdrawPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, history] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { coins: true } }),
    prisma.withdrawal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const lastBank = history[0]
    ? {
        bankName: history[0].bankName,
        bankAccountNumber: history[0].bankAccountNumber,
        bankAccountName: history[0].bankAccountName,
      }
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Banknote className="h-6 w-6 text-accent" />
          <div>
            <h1 className="text-xl font-semibold">Rút coin về ngân hàng</h1>
            <p className="text-sm text-muted">Số dư hiện tại: {user?.coins ?? 0} coins</p>
          </div>
        </div>
        <p className="mb-4 text-xs text-muted">
          Coin sẽ bị trừ ngay khi gửi yêu cầu. Admin kiểm tra và tự chuyển khoản thật vào tài khoản bạn cung cấp, sau
          đó xác nhận trong hệ thống. Nếu yêu cầu bị từ chối, coin sẽ được hoàn lại.
        </p>
        <WithdrawForm coins={user?.coins ?? 0} lastBank={lastBank} />
      </GlassCard>

      {history.length > 0 && (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {history.map((w) => (
            <div key={w.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">
                  {w.coins} coins · {w.amountVnd.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-xs text-muted">
                  {w.bankName} · {w.bankAccountNumber}
                </p>
              </div>
              <span
                className={
                  w.status === "COMPLETED"
                    ? "text-emerald-500"
                    : w.status === "REJECTED"
                      ? "text-red-500"
                      : "text-accent"
                }
              >
                {STATUS_LABEL[w.status]}
              </span>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
