import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { AddSectionForm } from "./add-section-form";
import { SectionCard } from "./section-card";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Đang chờ admin kiểm duyệt",
  APPROVED: "Đã duyệt — đang mở bán",
  REJECTED: "Bị từ chối",
};

export default async function ManageCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { sections: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
  });
  if (!course) notFound();
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") notFound();

  const myQuizzes = await prisma.quiz.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <Link href={`/courses/${course.id}`} className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Xem trang khoá học
          </Link>
          <h1 className="mt-1 text-xl font-semibold">{course.title}</h1>
        </div>
      </div>

      <GlassCard className="p-4">
        <p className="text-sm">
          Trạng thái: <span className="font-medium">{STATUS_LABEL[course.status]}</span>
        </p>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-3 text-sm font-medium text-muted">Thêm chương mới</h2>
        <AddSectionForm courseId={course.id} />
      </GlassCard>

      <div className="space-y-4">
        {course.sections.map((section) => (
          <SectionCard
            key={section.id}
            courseId={course.id}
            sectionId={section.id}
            title={section.title}
            lessons={section.lessons}
            myQuizzes={myQuizzes}
          />
        ))}
      </div>
    </div>
  );
}
