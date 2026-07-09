import Link from "next/link";
import { GraduationCap, Plus, Star } from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: {
      instructor: { select: { displayName: true, username: true } },
      ratings: { select: { stars: true } },
      _count: { select: { enrollments: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Khoá học</h1>
          <p className="text-sm text-muted">Học video, tài liệu, bài tập, kiểm tra — nhận chứng chỉ khi hoàn thành.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/courses/teach" className={buttonVariants("glass")}>
            Khoá học của tôi
          </Link>
          <Link href="/courses/create" className={buttonVariants("primary")}>
            <Plus className="h-4 w-4" />
            Tạo khoá học
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Chưa có khoá học nào được duyệt. Hãy là người đầu tiên!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const avgRating = course.ratings.length
              ? course.ratings.reduce((sum, r) => sum + r.stars, 0) / course.ratings.length
              : null;
            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <GlassCard className="h-full overflow-hidden p-0 transition hover:-translate-y-0.5">
                  <div className="flex h-32 items-center justify-center gradient-cyber">
                    {course.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <GraduationCap className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-accent">
                      {course.category} · {course.level}
                    </span>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{course.title}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {course.instructor.displayName ?? course.instructor.username ?? "Giảng viên"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{course.price} coins</span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        {avgRating !== null && (
                          <>
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            {avgRating.toFixed(1)}
                          </>
                        )}
                        {course._count.enrollments} học viên
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
