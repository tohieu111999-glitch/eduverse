import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { CourseModerationActions } from "./moderation-actions";

export default async function AdminCoursesPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const pending = await prisma.course.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { instructor: { select: { displayName: true, username: true } }, sections: { include: { lessons: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Kiểm duyệt khoá học</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quản trị
        </Link>
      </div>

      {pending.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Không có khoá học nào đang chờ duyệt.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((course) => {
            const lessonCount = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
            return (
              <GlassCard key={course.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-xs text-muted">
                      {course.category} · {course.level} · Giảng viên: {course.instructor.displayName ?? course.instructor.username}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {course.sections.length} chương · {lessonCount} bài học
                    </p>
                    <p className="mt-2 text-sm">{course.description}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-primary">{course.price} coin</span>
                </div>
                <div className="mt-4">
                  <CourseModerationActions courseId={course.id} />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
