import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { DocumentPreview } from "@/src/components/document/document-preview";
import { TranslateLookup } from "@/src/components/translate/translate-lookup";
import { LESSON_TYPE_LABELS } from "@/src/lib/courses";
import { canAccessCourseContent } from "@/src/lib/course-access";
import { SubmitAssignmentForm } from "./submit-assignment-form";
import { markLessonCompleteAction } from "./actions";

function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function isExternal(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!(await canAccessCourseContent(courseId, session.user.id))) notFound();

  const [lesson, course] = await Promise.all([
    prisma.courseLesson.findUnique({
      where: { id: lessonId },
      include: {
        assignment: {
          include: {
            submissions: { where: { userId: session.user.id }, take: 1 },
          },
        },
      },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, type: true } } },
        },
      },
    }),
  ]);

  if (!lesson || !course) notFound();

  // Verify lesson belongs to this course
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) notFound();

  // If QUIZ lesson, redirect to the quiz take page
  if (lesson.type === "QUIZ" && lesson.quizId) {
    redirect(`/learn/quiz/${lesson.quizId}/take`);
  }

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });
  const isCompleted = Boolean(progress?.completed);

  const submission = lesson.assignment?.submissions[0];
  const isInstructor = course.instructorId === session.user.id;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href={`/courses/${courseId}`} className="hover:text-foreground">
          {course.title}
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{lesson.title}</span>
      </div>

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {/* Lesson header */}
          <GlassCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs text-accent">{LESSON_TYPE_LABELS[lesson.type]}</span>
                <h1 className="mt-1 text-xl font-semibold">{lesson.title}</h1>
              </div>
              {isCompleted && (
                <span className="flex shrink-0 items-center gap-1.5 text-sm text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Đã hoàn thành
                </span>
              )}
            </div>
          </GlassCard>

          {/* Content by type */}
          {lesson.type === "VIDEO" && lesson.videoUrl && (
            <GlassCard className="overflow-hidden p-0">
              {isExternal(lesson.videoUrl) ? (
                <iframe
                  src={toEmbedUrl(lesson.videoUrl)}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  controls
                  className="aspect-video w-full bg-black"
                  src={`/api/courses/${courseId}/content/${lessonId}`}
                  preload="metadata"
                />
              )}
            </GlassCard>
          )}

          {lesson.type === "PDF" && lesson.fileUrl && (
            <GlassCard className="p-5">
              <DocumentPreview
                fileUrl={`/api/courses/${courseId}/content/${lessonId}`}
                ext=".pdf"
              />
            </GlassCard>
          )}

          {lesson.type === "ARTICLE" && lesson.content && (
            <GlassCard className="p-6">
              <TranslateLookup>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{lesson.content}</p>
              </TranslateLookup>
            </GlassCard>
          )}

          {lesson.type === "ASSIGNMENT" && lesson.assignment && (
            <GlassCard className="space-y-4 p-6">
              <div>
                <h2 className="mb-2 text-sm font-medium text-muted">Đề bài</h2>
                <TranslateLookup>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{lesson.assignment.prompt}</p>
                </TranslateLookup>
              </div>

              {submission && (
                <div className="rounded-xl border border-foreground/10 p-4">
                  <p className="mb-1 text-xs font-medium text-muted">Bài nộp của bạn</p>
                  <p className="whitespace-pre-wrap text-sm">{submission.content}</p>
                  {submission.score !== null && (
                    <div className="mt-3 border-t border-foreground/10 pt-3">
                      <p className="text-sm font-semibold">
                        Điểm: <span className="text-primary">{submission.score}/10</span>
                      </p>
                      {submission.feedback && <p className="mt-1 text-sm text-muted">{submission.feedback}</p>}
                      {submission.gradedBy && (
                        <p className="mt-1 text-xs text-muted">Chấm bởi: {submission.gradedBy}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isInstructor && (
                <div>
                  <h2 className="mb-2 text-sm font-medium text-muted">
                    {submission ? "Nộp lại bài" : "Nộp bài"}
                  </h2>
                  <SubmitAssignmentForm
                    courseId={courseId}
                    lessonId={lessonId}
                    currentContent={submission?.content}
                  />
                </div>
              )}
            </GlassCard>
          )}

          {/* Mark complete (not for instructor, not for assignment which has its own submit) */}
          {!isInstructor && !isCompleted && lesson.type !== "ASSIGNMENT" && (
            <form
              action={async () => {
                "use server";
                await markLessonCompleteAction(courseId, lessonId);
              }}
            >
              <button
                type="submit"
                className={buttonVariants("primary", "w-full")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Đánh dấu hoàn thành
              </button>
            </form>
          )}
        </div>

        {/* Course outline sidebar */}
        <aside className="space-y-4">
          <GlassCard className="p-4">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Nội dung khoá học</h2>
            <div className="space-y-3">
              {course.sections.map((section) => (
                <div key={section.id}>
                  <p className="mb-1 text-xs font-semibold text-muted">{section.title}</p>
                  <ul className="space-y-1">
                    {section.lessons.map((l) => (
                      <li key={l.id}>
                        <Link
                          href={
                            l.type === "QUIZ"
                              ? `/courses/${courseId}/learn/${l.id}`
                              : `/courses/${courseId}/learn/${l.id}`
                          }
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition ${
                            l.id === lessonId
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted hover:bg-foreground/5 hover:text-foreground"
                          }`}
                        >
                          <span className="shrink-0 rounded bg-foreground/10 px-1.5 py-0.5 text-[10px]">
                            {LESSON_TYPE_LABELS[l.type]}
                          </span>
                          <span className="line-clamp-2">{l.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </GlassCard>
        </aside>
      </div>

      {/* Prev / Next navigation */}
      <div className="flex gap-3">
        {prevLesson ? (
          <Link href={`/courses/${courseId}/learn/${prevLesson.id}`} className={buttonVariants("glass", "flex-1")}>
            <ArrowLeft className="h-4 w-4" />
            {prevLesson.title}
          </Link>
        ) : (
          <Link href={`/courses/${courseId}`} className={buttonVariants("glass", "flex-1")}>
            <ArrowLeft className="h-4 w-4" />
            Trang khoá học
          </Link>
        )}
        {nextLesson ? (
          <Link href={`/courses/${courseId}/learn/${nextLesson.id}`} className={buttonVariants("primary", "flex-1")}>
            {nextLesson.title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link href={`/courses/${courseId}`} className={buttonVariants("glass", "flex-1")}>
            <ExternalLink className="h-4 w-4" />
            Về trang khoá học
          </Link>
        )}
      </div>
    </div>
  );
}
