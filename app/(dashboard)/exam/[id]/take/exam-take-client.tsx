"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Grid3X3, Headphones } from "lucide-react";
import { GlassCard } from "@/src/components/ui/glass-card";
import { submitExamAction } from "./actions";

export type ExamQ = {
  id: string;
  section: string;
  content: string;
  audioUrl: string | null;
  options: string[];
  order: number;
};

type Props = {
  examId: string;
  examTitle: string;
  attemptId: string;
  questions: ExamQ[];
  remainingSeconds: number;
  initialAnswers: Record<string, string>;
};

function formatTime(secs: number) {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function ExamTakeClient({
  examId,
  examTitle,
  attemptId,
  questions,
  remainingSeconds,
  initialAnswers,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const submittedRef = useRef(false);

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  function handleSubmit(auto = false) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (!auto && !showConfirm) {
      setShowConfirm(true);
      submittedRef.current = false;
      return;
    }
    setShowConfirm(false);
    startTransition(async () => {
      const result = await submitExamAction(attemptId, answers);
      if ("ok" in result) {
        router.push(`/exam/${result.examId}/result/${attemptId}`);
      } else {
        submittedRef.current = false;
      }
    });
  }

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const timerColor =
    timeLeft <= 60 ? "text-red-400" : timeLeft <= 180 ? "text-amber-400" : "text-primary";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Top bar */}
      <GlassCard className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{examTitle}</p>
          <p className="text-xs text-muted">
            {answeredCount}/{questions.length} câu đã trả lời
          </p>
        </div>
        <div className={`flex items-center gap-1.5 text-lg font-bold tabular-nums ${timerColor}`}>
          <Clock className="h-4 w-4" />
          {formatTime(timeLeft)}
        </div>
      </GlassCard>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question grid */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => {
          const answered = !!answers[q.id];
          const isCurrent = i === currentIdx;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition
                ${isCurrent
                  ? "ring-2 ring-primary bg-primary text-white"
                  : answered
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-foreground/5 text-muted border border-foreground/10 hover:bg-foreground/10"
                }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Current question */}
      {currentQ && (
        <GlassCard className="space-y-5 p-6">
          {/* Section badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-foreground/8 px-2.5 py-0.5 text-xs text-muted">
              {currentQ.section === "LISTENING" ? (
                <span className="flex items-center gap-1">
                  <Headphones className="h-3 w-3" /> Nghe hiểu
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Grid3X3 className="h-3 w-3" /> Đọc hiểu
                </span>
              )}
            </span>
            <span className="text-xs text-muted">Câu {currentIdx + 1}/{questions.length}</span>
          </div>

          {/* Audio player */}
          {currentQ.audioUrl && (
            <audio controls className="w-full" src={currentQ.audioUrl}>
              Trình duyệt không hỗ trợ audio.
            </audio>
          )}

          {/* Content */}
          <p className="text-base font-medium leading-relaxed">{currentQ.content}</p>

          {/* Options */}
          <div className="space-y-2.5">
            {(currentQ.options as string[]).map((opt, i) => {
              const letter = OPTION_LETTERS[i];
              const selected = answers[currentQ.id] === letter;
              return (
                <button
                  key={i}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [currentQ.id]: letter }))
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition
                    ${selected
                      ? "border-primary bg-primary/15 font-semibold text-primary"
                      : "border-foreground/10 bg-foreground/5 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                >
                  <span className={`mr-2 font-bold ${selected ? "text-primary" : "text-muted"}`}>
                    {letter}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="flex-1 rounded-xl border border-foreground/10 py-2.5 text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-40"
            >
              ← Câu trước
            </button>
            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((i) => i + 1)}
                className="flex-1 rounded-xl bg-primary/15 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/25"
              >
                Câu tiếp →
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={pending}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Đang nộp..." : "Nộp bài"}
              </button>
            )}
          </div>
        </GlassCard>
      )}

      {/* Submit button (always visible at bottom) */}
      <button
        onClick={() => handleSubmit(false)}
        disabled={pending}
        className="w-full rounded-xl border border-foreground/10 py-3 text-sm font-medium text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {pending ? "Đang nộp bài..." : `Nộp bài (${answeredCount}/${questions.length} câu đã làm)`}
      </button>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <GlassCard className="w-full max-w-sm space-y-4 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <p className="font-semibold">Xác nhận nộp bài?</p>
            </div>
            <p className="text-sm text-muted">
              Bạn đã trả lời{" "}
              <strong className="text-foreground">{answeredCount}/{questions.length}</strong> câu.{" "}
              {questions.length - answeredCount > 0 && (
                <span className="text-amber-400">
                  {questions.length - answeredCount} câu chưa làm sẽ bị tính sai.
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { submittedRef.current = false; setShowConfirm(false); }}
                className="flex-1 rounded-xl border border-foreground/10 py-2.5 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Làm tiếp
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={pending}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Đang nộp..." : "Nộp bài"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <GlassCard className="flex items-center gap-3 px-6 py-4">
            <CheckCircle2 className="h-5 w-5 animate-pulse text-primary" />
            <span className="text-sm font-medium">Đang chấm điểm...</span>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
