import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Plus, Star, Users } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đang mở",
  REJECTED: "Bị từ chối",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-amber-500",
  APPROVED: "text-emerald-500",
  REJECTED: "text-red-500",
};

export default async function TeachDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
      ratings: { select: { stars: true } },
      enrollments: { select: { completedAt: true } },
      sections: { include: { _count: { select: { lessons: true } } } },
    },
  });

  const totalStudents = courses.reduce((s, c) => s + c._count.enrollments, 0);
  const totalRevenue = courses.reduce((s, c) => {
    // 80% goes to instructor (splitCommission uses 20% platform cut)
    return s + Math.floor(c.price * 0.8) * c._count.enrollments;
  }, 0);
  const completedCount = courses.reduce((s, c) => s + c.enrollments.filter((e) => e.completedAt).length, 0);
  const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Khoá học của tôi</h1>
        <Link href="/courses/create" className={buttonVariants("primary")}>
          <Plus className="h-4 w-4" />
          Tạo khoá học
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs text-muted">Tổng học viên</p>
          <p className="mt-1 text-2xl font-bold">{totalStudents}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-muted">Tỉ lệ hoàn thành</p>
          <p className="mt-1 text-2xl font-bold">{completionRate}%</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-muted">Doanh thu (ước tính)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-500">{totalRevenue.toLocaleString()} coin</p>
        </GlassCard>
      </div>

      {/* Course list */}
      {courses.length === 0 ? (
        <GlassCard className="p-10 text-center text-muted">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p>Bạn chưa tạo khoá học nào.</p>
          <Link href="/courses/create" className={buttonVariants("primary", "mt-4 inline-flex")}>
            <Plus className="h-4 w-4" />
            Tạo khoá học đầu tiên
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const avgRating =
              course.ratings.length > 0
                ? (course.ratings.reduce((s, r) => s + r.stars, 0) / course.ratings.length).toFixed(1)
                : null;
            const lessonCount = course.sections.reduce((s, sec) => s + sec._count.lessons, 0);
            const completedStudents = course.enrollments.filter((e) => e.completedAt).length;
            const rate =
              course._count.enrollments > 0
                ? Math.round((completedStudents / course._count.enrollments) * 100)
                : 0;
            const revenue = Math.floor(course.price * 0.8) * course._count.enrollments;

            return (
              <GlassCard key={course.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/courses/${course.id}`} className="font-semibold hover:text-primary truncate">
                        {course.title}
                      </Link>
                      <span className={`shrink-0 text-xs font-medium ${STATUS_COLOR[course.status]}`}>
                        {STATUS_LABEL[course.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {course.sections.length} chương · {lessonCount} bài học · {course.price} coin
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted">
                        <Users className="h-3.5 w-3.5" />
                        {course._count.enrollments} học viên
                      </span>
                      {avgRating && (
                        <span className="flex items-center gap-1 text-muted">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          {avgRating} ({course.ratings.length})
                        </span>
                      )}
                      <span className="text-muted">Hoàn thành: {rate}%</span>
                      <span className="font-medium text-emerald-500">+{revenue.toLocaleString()} coin</span>
                    </div>
                  </div>
                  <Link href={`/courses/${course.id}/manage`} className={buttonVariants("glass", "shrink-0 text-xs")}>
                    Quản lý
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
