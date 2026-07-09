"use client";

import { useActionState, useRef, useState } from "react";
import { addLessonAction, type AddLessonState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { LESSON_TYPE_LABELS } from "@/src/lib/courses";

const initialState: AddLessonState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function AddLessonForm({
  courseId,
  sectionId,
  myQuizzes,
}: {
  courseId: string;
  sectionId: string;
  myQuizzes: { id: string; title: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState("VIDEO");
  const [videoSource, setVideoSource] = useState("upload");
  const action = addLessonAction.bind(null, courseId, sectionId);
  const [state, formAction, pending] = useActionState(async (prev: AddLessonState, fd: FormData) => {
    const result = await action(prev, fd);
    if (!result.error) {
      formRef.current?.reset();
      setType("VIDEO");
      setVideoSource("upload");
    }
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="space-y-2 rounded-xl border border-foreground/10 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="title" placeholder="Tên bài học" className={inputClass} required />
        <select value={type} onChange={(e) => setType(e.target.value)} name="type" className={inputClass}>
          {Object.entries(LESSON_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {type === "VIDEO" && (
        <div className="space-y-2">
          <div className="flex gap-3 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="videoSource"
                value="upload"
                checked={videoSource === "upload"}
                onChange={() => setVideoSource("upload")}
              />
              Tải file lên
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="videoSource"
                value="url"
                checked={videoSource === "url"}
                onChange={() => setVideoSource("url")}
              />
              Dán link video (YouTube/Vimeo embed...)
            </label>
          </div>
          {videoSource === "upload" ? (
            <input name="videoFile" type="file" accept="video/mp4,video/webm,video/quicktime" className={inputClass} />
          ) : (
            <input name="videoUrl" placeholder="https://www.youtube.com/embed/..." className={inputClass} />
          )}
        </div>
      )}

      {type === "PDF" && <input name="pdfFile" type="file" accept="application/pdf" className={inputClass} />}

      {type === "ARTICLE" && (
        <textarea name="content" rows={4} placeholder="Nội dung bài viết" className={inputClass} />
      )}

      {type === "ASSIGNMENT" && (
        <textarea name="assignmentPrompt" rows={3} placeholder="Đề bài tập" className={inputClass} />
      )}

      {type === "QUIZ" && (
        <select name="quizId" className={inputClass} defaultValue="">
          <option value="" disabled>
            {myQuizzes.length === 0 ? "Bạn chưa có quiz nào — tạo ở mục Học tập" : "Chọn một quiz đã tạo"}
          </option>
          {myQuizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
      )}

      {state.error && <p className="text-xs text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} variant="glass" className="w-full">
        {pending ? "Đang thêm..." : "Thêm bài học"}
      </Button>
    </form>
  );
}
