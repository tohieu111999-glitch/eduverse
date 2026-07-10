import { notFound, redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { ExamTakeClient } from "./exam-take-client";

export default async function ExamTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exam = await prisma.exam.findUnique({
    where: { id, isActive: true },
    include: {
      questions: { orderBy: [{ section: "asc" }, { order: "asc" }] },
    },
  });
  if (!exam) notFound();
  if (exam.questions.length === 0) notFound();

  const now = new Date();
  const cutoff = new Date(now.getTime() - exam.duration * 60 * 1000 * 2);

  // Reuse an unfinished attempt started within 2× the exam duration
  let attempt = await prisma.examAttempt.findFirst({
    where: {
      userId: session.user.id,
      examId: exam.id,
      finishedAt: null,
      startedAt: { gte: cutoff },
    },
    orderBy: { startedAt: "desc" },
  });

  if (!attempt) {
    attempt = await prisma.examAttempt.create({
      data: {
        userId: session.user.id,
        examId: exam.id,
        totalQuestions: exam.questions.length,
      },
    });
  } else if (attempt.finishedAt) {
    redirect(`/exam/${exam.id}/result/${attempt.id}`);
  }

  const elapsedSeconds = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000);
  const remainingSeconds = Math.max(0, exam.duration * 60 - elapsedSeconds);

  const initialAnswers = (attempt.answers as Record<string, string>) ?? {};

  const questions = exam.questions.map((q) => ({
    id: q.id,
    section: q.section as string,
    content: q.content,
    audioUrl: q.audioUrl,
    options: q.options as string[],
    order: q.order,
  }));

  return (
    <ExamTakeClient
      examId={exam.id}
      examTitle={exam.title}
      attemptId={attempt.id}
      questions={questions}
      remainingSeconds={remainingSeconds}
      initialAnswers={initialAnswers}
    />
  );
}
