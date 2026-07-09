import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, PlayCircle, Settings, Star } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { LESSON_TYPE_LABELS } from "@/src/lib/courses";
import { BuyCourseButton } from "./buy-button";
import { RatingForm } from "./rating-form";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { id: true, displayName: true, username: true } },
      sections: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      ratings: { include: { user: { select: { displayName: true, username: true } } }, orderBy: { createdAt: "desc" } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) notFound();

  const isInstructor = course.instructorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (course.status !== "APPROVED" && !isInstructor && !isAdmin) notFound();

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId: session.user.id } },
  });
  const isEnrolled = Boolean(enrollment);
  const myRating = course.ratings.find((r) => r.userId === session.user.id);

  const avgRating = course.ratings.length ? course.ratings.reduce((s, r) => s + r.stars, 0) / course.ratings.length : null;
  const lessonCount = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <GlassCard className="overflow-hidden p-0">
        <div className="flex h-48 items-center justify-center gradient-cyber">
          {course.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
          ) : (
            <GraduationCap className="h-14 w-14 text-white" />
          )}
        </div>
        <div className="p-6">
          {course.status !== "APPROVED" && (
            <span className="mb-3 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
              {course.status === "PENDING" ? "Đang chờ admin kiểm duyệt" : "Bị từ chối"}
            </span>
          )}
          <span className="text-xs text-accent">
            {course.category} · {course.level}
          </span>
          <h1 className="mt-1 text-2xl font-semibold">{course.title}</h1>
          <p className="mt-1 text-sm text-muted">
            Giảng viên: {course.instructor.displayName ?? course.instructor.username}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm">{course.description}</p>

          <div className="mt-6 flex items-center justify-between text-sm text-muted">
            <span className="flex items-center gap-1">
              {avgRating !== null && (
                <>
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {avgRating.toFixed(1)} ({course.ratings.length})
                </>
              )}
            </span>
            <span>{course._count.enrollments} học viên</span>
            <span className="text-lg font-bold text-primary">{course.price} coins</span>
          </div>

          <div className="mt-6 space-y-2">
            {isInstructor && (
              <Link href={`/courses/${course.id}/manage`} className={buttonVariants("glass", "w-full")}>
                <Settings className="h-4 w-4" />
                Quản lý khoá học
              </Link>
            )}
            {!isInstructor && isEnrolled && course.sections[0]?.lessons[0] && (
              <Link
                href={`/courses/${course.id}/learn/${course.sections[0].lessons[0].id}`}
                className={buttonVariants("primary", "w-full")}
              >
                <PlayCircle className="h-4 w-4" />
                Vào học
              </Link>
            )}
            {!isInstructor && !isEnrolled && course.status === "APPROVED" && (
              <BuyCourseButton courseId={course.id} price={course.price} />
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-3 text-sm font-medium text-muted">
          Nội dung khoá học · {course.sections.length} chương · {lessonCount} bài học
        </h2>
        <div className="space-y-3">
          {course.sections.map((section) => (
            <div key={section.id}>
              <p className="text-sm font-semibold">{section.title}</p>
              <ul className="mt-1 space-y-1">
                {section.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-2 text-xs text-muted">
                    <span className="rounded-full bg-foreground/10 px-2 py-0.5">{LESSON_TYPE_LABELS[lesson.type]}</span>
                    {lesson.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </GlassCard>

      {isEnrolled && (
        <GlassCard className="p-6">
          <h2 className="mb-3 text-sm font-medium text-muted">{myRating ? "Cập nhật đánh giá" : "Đánh giá khoá học"}</h2>
          <RatingForm courseId={course.id} currentStars={myRating?.stars} />
        </GlassCard>
      )}

      {course.ratings.length > 0 && (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {course.ratings.map((r) => (
            <div key={r.id} className="px-3 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.user.displayName ?? r.user.username}</span>
                <span className="flex items-center gap-0.5 text-xs text-accent">
                  <Star className="h-3 w-3 fill-accent" />
                  {r.stars}
                </span>
              </div>
              {r.comment && <p className="mt-1 text-xs text-muted">{r.comment}</p>}
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
