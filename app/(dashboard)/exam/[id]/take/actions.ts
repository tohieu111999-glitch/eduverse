"use server";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function submitExamAction(
  attemptId: string,
  answers: Record<string, string>
): Promise<{ ok: true; examId: string } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { questions: true } } },
  });

  if (!attempt) return { error: "Không tìm thấy bài thi" };
  if (attempt.userId !== session.user.id) return { error: "Không có quyền truy cập" };
  if (attempt.finishedAt) return { ok: true, examId: attempt.examId };

  const questions = attempt.exam.questions;
  let correctCount = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctAnswer) correctCount++;
  }

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const expGained = correctCount * 2;

  await Promise.all([
    prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        answers,
        score,
        correctCount,
        totalQuestions,
        finishedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { exp: { increment: expGained } },
    }),
  ]);

  return { ok: true, examId: attempt.examId };
}
