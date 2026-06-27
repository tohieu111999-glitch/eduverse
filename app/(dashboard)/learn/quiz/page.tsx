import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trophy, Globe, Users, Lock } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { quizLanguageLabel } from "@/src/lib/quiz";
import { visibleQuizWhereClause } from "@/src/lib/quiz-access";

const VISIBILITY_ICON = { PUBLIC: Globe, FRIENDS: Users, PRIVATE: Lock };

export default async function QuizListPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const quizzes = await prisma.quiz.findMany({
    where: await visibleQuizWhereClause(session.user.id),
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-accent" />
          <div>
            <h1 className="text-xl font-semibold">Mini Quiz</h1>
            <Link href="/learn" className="text-xs text-muted hover:underline">
              ← Bộ thẻ ghi nhớ
            </Link>
          </div>
        </div>
        <Link href="/learn/quiz/create" className={buttonVariants("primary")}>
          <Plus className="h-4 w-4" />
          Tạo quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Chưa có quiz nào. Hãy tạo quiz đầu tiên!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => {
            const VisibilityIcon = VISIBILITY_ICON[quiz.visibility];
            return (
              <Link key={quiz.id} href={`/learn/quiz/${quiz.id}`}>
                <GlassCard className="p-4 transition hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{quiz.title}</h3>
                    <VisibilityIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                  </div>
                  {quiz.description && <p className="mt-1 text-xs text-muted line-clamp-2">{quiz.description}</p>}
                  <p className="mt-3 text-xs text-muted">
                    {quiz._count.questions} câu hỏi · {quizLanguageLabel(quiz.language)}
                  </p>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
