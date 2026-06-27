import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { buildVietQrUrl, getBankInfo } from "@/src/lib/topup";

export default async function TopupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const topup = await prisma.coinTopup.findUnique({ where: { id } });
  if (!topup) notFound();
  if (topup.userId !== session.user.id && session.user.role !== "ADMIN") notFound();

  const bank = getBankInfo();
  const qrUrl = topup.status === "PENDING" ? buildVietQrUrl({ amount: topup.amount, reference: topup.reference }) : null;

  return (
    <div className="mx-auto max-w-md">
      <GlassCard className="p-6 text-center">
        {topup.status === "COMPLETED" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-3 text-lg font-semibold">Nạp coin thành công</h1>
            <p className="mt-1 text-sm text-muted">{topup.coins} coins đã được cộng vào tài khoản của bạn.</p>
          </>
        )}

        {topup.status === "CANCELLED" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-3 text-lg font-semibold">Yêu cầu đã bị huỷ</h1>
            <p className="mt-1 text-sm text-muted">Liên hệ admin nếu bạn đã chuyển khoản nhưng yêu cầu bị huỷ.</p>
          </>
        )}

        {topup.status === "PENDING" && (
          <>
            <Clock className="mx-auto h-10 w-10 text-accent" />
            <h1 className="mt-3 text-lg font-semibold">Chuyển khoản để nhận {topup.coins} coins</h1>
            <p className="mt-1 text-2xl font-bold text-primary">{topup.amount.toLocaleString("vi-VN")}đ</p>

            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="VietQR" className="mx-auto mt-4 h-64 w-64 rounded-xl border border-foreground/10" />
            ) : (
              <p className="mt-4 rounded-xl bg-accent/10 p-4 text-sm text-accent">
                Quản trị viên chưa cấu hình tài khoản nhận chuyển khoản. Vui lòng liên hệ admin để hoàn tất nạp coin
                thủ công với mã tham chiếu bên dưới.
              </p>
            )}

            <div className="mt-4 rounded-xl bg-foreground/5 p-3 text-sm">
              <p className="text-muted">Nội dung chuyển khoản (bắt buộc)</p>
              <p className="font-mono font-bold">{topup.reference}</p>
            </div>
            {bank && (
              <p className="mt-3 text-xs text-muted">
                {bank.accountName} · {bank.accountNumber}
              </p>
            )}
            <p className="mt-3 text-xs text-muted">
              Sau khi chuyển khoản, admin sẽ xác nhận và cộng coins trong thời gian ngắn.
            </p>
          </>
        )}

        <Link href="/topup" className={buttonVariants("glass", "mt-6 w-full")}>
          Quay lại
        </Link>
      </GlassCard>
    </div>
  );
}
