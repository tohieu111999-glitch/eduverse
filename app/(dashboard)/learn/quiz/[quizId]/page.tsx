import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Play } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { quizLanguageLabel } from "@/src/lib/quiz";
import { canViewQuiz } from "@/src/lib/quiz-access";
import { AddQuestionForm } from "./add-question-form";
import { QuestionRow } from "./question-row";
import { DeleteQuizButton } from "./delete-quiz-button";
import { GenerateQuestionsForm } from "./generate-questions-form";
import { VisibilitySelect } from "./visibility-select";

export default async function QuizDetailPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) notFound();
  if (!(await canViewQuiz(quiz, session.user.id))) notFound();

  const isOwner = quiz.ownerId === session.user.id;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{quiz.title}</h1>
            {quiz.description && <p className="mt-1 text-sm text-muted">{quiz.description}</p>}
            <p className="mt-2 text-xs text-muted">
              {quiz.questions.length} câu hỏi · {quizLanguageLabel(quiz.language)}
            </p>
            {isOwner && (
              <div className="mt-2">
                <VisibilitySelect quizId={quiz.id} visibility={quiz.visibility} />
              </div>
            )}
          </div>
          {isOwner && <DeleteQuizButton quizId={quiz.id} />}
        </div>

        {quiz.questions.length > 0 && (
          <Link href={`/learn/quiz/${quiz.id}/take`} className={buttonVariants("primary", "mt-4 w-full")}>
            <Play className="h-4 w-4" />
            Bắt đầu làm bài
          </Link>
        )}
      </GlassCard>

      {isOwner && (
        <>
          <GlassCard className="p-6">
            <h2 className="mb-3 text-sm font-medium text-muted">Thêm câu hỏi</h2>
            <AddQuestionForm quizId={quiz.id} />
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="mb-1 text-sm font-medium text-muted">Tạo câu hỏi bằng AI từ file</h2>
            <p className="mb-3 text-xs text-muted">Tải lên file .txt hoặc .pdf chứa từ vựng/nội dung, AI sẽ tự soạn câu hỏi.</p>
            <GenerateQuestionsForm quizId={quiz.id} />
          </GlassCard>
        </>
      )}

      {quiz.questions.length > 0 && (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {quiz.questions.map((q) => (
            <QuestionRow key={q.id} quizId={quiz.id} questionId={q.id} type={q.type} prompt={q.prompt} canDelete={isOwner} />
          ))}
        </GlassCard>
      )}
    </div>
  );
}
