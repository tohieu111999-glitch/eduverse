"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteSectionAction, deleteLessonAction } from "./actions";
import { AddLessonForm } from "./add-lesson-form";
import { LESSON_TYPE_LABELS } from "@/src/lib/courses";

type Lesson = { id: string; title: string; type: string };

export function SectionCard({
  courseId,
  sectionId,
  title,
  lessons,
  myQuizzes,
}: {
  courseId: string;
  sectionId: string;
  title: string;
  lessons: Lesson[];
  myQuizzes: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDeleteSection() {
    if (!confirm(`Xoá chương "${title}" và toàn bộ bài học bên trong?`)) return;
    setPending(true);
    await deleteSectionAction(courseId, sectionId);
    setPending(false);
    router.refresh();
  }

  async function handleDeleteLesson(lessonId: string) {
    await deleteLessonAction(courseId, lessonId);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-foreground/10 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <button onClick={handleDeleteSection} disabled={pending} className="text-muted hover:text-red-500">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {lessons.length > 0 && (
        <div className="mb-3 divide-y divide-foreground/10">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                <span className="mr-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                  {LESSON_TYPE_LABELS[lesson.type]}
                </span>
                {lesson.title}
              </span>
              <button onClick={() => handleDeleteLesson(lesson.id)} className="text-muted hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AddLessonForm courseId={courseId} sectionId={sectionId} myQuizzes={myQuizzes} />
    </div>
  );
}
