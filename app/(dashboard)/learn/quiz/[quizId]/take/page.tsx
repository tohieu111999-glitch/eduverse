import { notFound, redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { canViewQuiz } from "@/src/lib/quiz-access";
import { QuizSession } from "./quiz-session";

export default async function TakeQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      language: true,
      ownerId: true,
      visibility: true,
      // The correct `answer` is intentionally never sent to the client —
      // checking happens server-side in checkAnswerAction/submitQuizAttemptAction.
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, prompt: true, options: true },
      },
    },
  });
  if (!quiz) notFound();
  if (!(await canViewQuiz(quiz, session.user.id))) notFound();
  if (quiz.questions.length === 0) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-center text-lg font-semibold">{quiz.title}</h1>
      <QuizSession quizId={quizId} questions={quiz.questions} language={quiz.language} />
    </div>
  );
}
