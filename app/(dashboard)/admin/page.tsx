import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Banknote, ClipboardList, Coins, Crown, FileText, GraduationCap, PenLine, Settings, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const [pendingDocuments, pendingCourses, pendingTopups, pendingWithdrawals, totalUsers, revenueToday] = await Promise.all([
    prisma.document.count({ where: { status: "PENDING" } }),
    prisma.course.count({ where: { status: "PENDING" } }),
    prisma.coinTopup.count({ where: { status: "PENDING" } }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.coinTopup.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED", createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Quản trị</h1>
        </div>
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quay về trang chủ
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/revenue">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            <h2 className="mt-3 font-semibold">Doanh thu</h2>
            <p className="text-sm text-muted">Hôm nay: {(revenueToday._sum.amount ?? 0).toLocaleString("vi-VN")}đ</p>
          </GlassCard>
        </Link>
        <Link href="/admin/documents">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="mt-3 font-semibold">Kiểm duyệt tài liệu</h2>
            <p className="text-sm text-muted">{pendingDocuments} tài liệu đang chờ duyệt</p>
          </GlassCard>
        </Link>
        <Link href="/admin/courses">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <GraduationCap className="h-6 w-6 text-purple-400" />
            <h2 className="mt-3 font-semibold">Kiểm duyệt khoá học</h2>
            <p className="text-sm text-muted">{pendingCourses} khoá học đang chờ duyệt</p>
          </GlassCard>
        </Link>
        <Link href="/admin/topups">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <Coins className="h-6 w-6 text-accent" />
            <h2 className="mt-3 font-semibold">Duyệt nạp coin</h2>
            <p className="text-sm text-muted">{pendingTopups} yêu cầu đang chờ duyệt</p>
          </GlassCard>
        </Link>
        <Link href="/admin/withdrawals">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <Banknote className="h-6 w-6 text-emerald-400" />
            <h2 className="mt-3 font-semibold">Duyệt rút coin</h2>
            <p className="text-sm text-muted">{pendingWithdrawals} yêu cầu đang chờ duyệt</p>
          </GlassCard>
        </Link>
        <Link href="/admin/users">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <Users className="h-6 w-6 text-cyber-blue" />
            <h2 className="mt-3 font-semibold">Quản lý người dùng</h2>
            <p className="text-sm text-muted">{totalUsers} người dùng</p>
          </GlassCard>
        </Link>
        <Link href="/admin/exams">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <PenLine className="h-6 w-6 text-cyan-400" />
            <h2 className="mt-3 font-semibold">Quản lý đề thi</h2>
            <p className="text-sm text-muted">Tạo, sửa, ẩn/hiện đề thi thử HSK, TOCFL</p>
          </GlassCard>
        </Link>
        <Link href="/admin/audit-log">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <ClipboardList className="h-6 w-6 text-purple-400" />
            <h2 className="mt-3 font-semibold">Nhật ký kiểm duyệt</h2>
            <p className="text-sm text-muted">Lịch sử thao tác tài chính & bảo mật</p>
          </GlassCard>
        </Link>
        <Link href="/admin/settings">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <Settings className="h-6 w-6 text-muted" />
            <h2 className="mt-3 font-semibold">Cài đặt hệ thống</h2>
            <p className="text-sm text-muted">Chế độ tự phê duyệt nạp coin</p>
          </GlassCard>
        </Link>
        <Link href="/admin/vip">
          <GlassCard className="p-5 transition hover:-translate-y-0.5">
            <Crown className="h-6 w-6 text-amber-400" />
            <h2 className="mt-3 font-semibold">Cấu hình VIP</h2>
            <p className="text-sm text-muted">Chỉnh giá gói VIP 1 tháng / năm / trọn đời</p>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}
