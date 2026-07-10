import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Star, Trophy, XCircle } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";

const OPTION_LETTERS = ["A", "B", "C", "D"];

function formatDuration(startedAt: Date, finishedAt: Date) {
  const secs = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m} phút ${s} giây` : `${s} giây`;
}

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id, attemptId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: { orderBy: [{ section: "asc" }, { order: "asc" }] },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id) notFound();
  if (attempt.examId !== id) notFound();
  if (!attempt.finishedAt) redirect(`/exam/${id}/take`);

  const answers = (attempt.answers as Record<string, string>) ?? {};
  const questions = attempt.exam.questions;
  const correctCount = attempt.correctCount;
  const totalQuestions = attempt.totalQuestions || questions.length;
  const wrongCount = totalQuestions - correctCount;
  const unanswered = totalQuestions - Object.keys(answers).length;
  const expGained = correctCount * 2;
  const score = attempt.score;

  const scoreColor =
    score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  const scoreBg =
    score >= 80 ? "bg-green-500/15" : score >= 60 ? "bg-amber-500/15" : "bg-red-500/15";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Score hero */}
      <GlassCard className={`p-8 text-center ${scoreBg}`}>
        <p className="text-sm text-muted">Kết quả thi</p>
        <p className="mt-1 text-sm font-medium">{attempt.exam.title}</p>
        <p className={`mt-4 text-7xl font-bold ${scoreColor}`}>{score}%</p>
        <p className="mt-2 text-sm text-muted">
          {score >= 80 ? "Xuất sắc! 🎉" : score >= 60 ? "Khá tốt! 👍" : "Cần cố gắng thêm 💪"}
        </p>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-green-500/10 py-3">
            <p className="text-xl font-bold text-green-400">{correctCount}</p>
            <p className="text-[11px] text-muted">Đúng</p>
          </div>
          <div className="rounded-xl bg-red-500/10 py-3">
            <p className="text-xl font-bold text-red-400">{wrongCount - unanswered}</p>
            <p className="text-[11px] text-muted">Sai</p>
          </div>
          <div className="rounded-xl bg-foreground/5 py-3">
            <p className="text-xl font-bold text-muted">{unanswered}</p>
            <p className="text-[11px] text-muted">Bỏ qua</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-5 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(attempt.startedAt, attempt.finishedAt)}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            +{expGained} EXP
          </span>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/exam/${id}/take`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-foreground/10 py-2.5 text-sm font-medium text-muted transition hover:text-foreground"
        >
          Làm lại
        </Link>
        <Link
          href="/exam"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Trophy className="h-4 w-4" />
          Chọn đề khác
        </Link>
      </div>

      {/* Question review */}
      <section className="space-y-4">
        <h2 className="font-semibold">Xem lại bài làm</h2>
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isSkipped = !userAnswer;

          return (
            <GlassCard key={q.id} className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {isSkipped ? (
                    <span className="mt-0.5 shrink-0 text-muted">–</span>
                  ) : isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  )}
                  <div>
                    <p className="text-[11px] text-muted">Câu {idx + 1}</p>
                    <p className="mt-0.5 text-sm font-medium">{q.content}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pl-7">
                {(q.options as string[]).map((opt, i) => {
                  const letter = OPTION_LETTERS[i];
                  const isCorrectOpt = letter === q.correctAnswer;
                  const isUserOpt = letter === userAnswer;

                  return (
                    <div
                      key={i}
                      className={`rounded-lg border px-3 py-2 text-sm transition
                        ${isCorrectOpt
                          ? "border-green-500/40 bg-green-500/10 text-green-300"
                          : isUserOpt && !isCorrect
                          ? "border-red-500/40 bg-red-500/10 text-red-300 line-through"
                          : "border-foreground/8 text-muted"
                        }`}
                    >
                      <span className="mr-2 font-bold">{letter}.</span>
                      {opt}
                      {isCorrectOpt && (
                        <span className="ml-2 text-xs text-green-400">✓ Đúng</span>
                      )}
                      {isUserOpt && !isCorrect && (
                        <span className="ml-2 text-xs text-red-400">✗ Bạn chọn</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="ml-7 rounded-xl bg-primary/8 px-3 py-2 text-xs text-foreground/70">
                  💡 {q.explanation}
                </div>
              )}
            </GlassCard>
          );
        })}
      </section>
    </div>
  );
}
