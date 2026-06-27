import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";

const ACTION_LABEL: Record<string, string> = {
  TOPUP_APPROVED: "Duyệt nạp coin",
  TOPUP_AUTO_APPROVED: "Tự động duyệt nạp coin",
  TOPUP_CANCELLED: "Huỷ yêu cầu nạp coin",
  WITHDRAWAL_COMPLETED: "Xác nhận đã chuyển khoản rút coin",
  WITHDRAWAL_REJECTED: "Từ chối yêu cầu rút coin",
  DOCUMENT_APPROVED: "Duyệt tài liệu",
  DOCUMENT_REJECTED: "Từ chối tài liệu",
  USER_BANNED: "Khoá tài khoản",
  USER_UNBANNED: "Mở khoá tài khoản",
  ROLE_CHANGED: "Đổi vai trò",
};

export default async function AuditLogPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { username: true, displayName: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-purple-400" />
          <h1 className="text-xl font-semibold">Nhật ký kiểm duyệt</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quản trị
        </Link>
      </div>

      <GlassCard className="divide-y divide-foreground/10 p-2">
        {logs.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted">Chưa có hoạt động nào được ghi nhận.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="px-3 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ACTION_LABEL[log.action] ?? log.action}</span>
                <span className="text-xs text-muted">{log.createdAt.toLocaleString("vi-VN")}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Người thực hiện: {log.actor ? log.actor.displayName ?? log.actor.username : "Hệ thống (tự động)"}
                {log.targetType && ` · ${log.targetType}: ${log.targetId}`}
              </p>
              {log.metadata !== null && log.metadata !== undefined && (
                <p className="mt-0.5 break-all text-xs text-muted/70">{JSON.stringify(log.metadata)}</p>
              )}
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}
