"use server";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { awardExp } from "@/src/lib/gamification";
import { awardAchievement } from "@/src/lib/achievements";
import { canViewQuiz } from "@/src/lib/quiz-access";
import { updateStreak } from "@/src/lib/streak";
import { incrementQuestProgress, QUEST_CODES } from "@/src/lib/daily-quests";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

// Used only for the immediate per-question feedback shown during the quiz —
// the reward-granting score is always recomputed server-side in
// submitQuizAttemptAction, never trusted from the client's running tally.
export async function checkAnswerAction(questionId: string, userAnswer: string) {
  const session = await auth();
  if (!session?.user) return { correct: false, correctAnswer: "" };

  const question = await prisma.quizQuestion.findUnique({ where: { id: questionId }, include: { quiz: true } });
  if (!question) return { correct: false, correctAnswer: "" };
  if (!(await canViewQuiz(question.quiz, session.user.id))) return { correct: false, correctAnswer: "" };

  return { correct: normalize(userAnswer) === normalize(question.answer), correctAnswer: question.answer };
}

export async function submitQuizAttemptAction(quizId: string, answers: { questionId: string; userAnswer: string }[]) {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || !(await canViewQuiz(quiz, session.user.id))) return { error: "Không thể truy cập quiz này" };

  const questions = await prisma.quizQuestion.findMany({ where: { quizId } });
  const answerByQuestionId = new Map(questions.map((q) => [q.id, q.answer]));

  let score = 0;
  for (const a of answers) {
    const correctAnswer = answerByQuestionId.get(a.questionId);
    if (correctAnswer && normalize(a.userAnswer) === normalize(correctAnswer)) score += 1;
  }

  await prisma.quizAttempt.create({
    data: { quizId, userId: session.user.id, score, totalQuestions: questions.length },
  });

  await awardExp(session.user.id, score * 3);
  await updateStreak(session.user.id);

  await incrementQuestProgress(session.user.id, QUEST_CODES.QUIZ_1);

  const attemptCount = await prisma.quizAttempt.count({ where: { userId: session.user.id } });
  if (attemptCount === 1) await awardAchievement(session.user.id, "FIRST_QUIZ");

  return { score, total: questions.length };
}
