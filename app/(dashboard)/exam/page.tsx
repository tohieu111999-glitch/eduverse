import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { ExamClient } from "./exam-client";

export default async function ExamPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exams = await prisma.exam.findMany({
    where: { isActive: true },
    orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  });

  const hskExams = exams
    .filter((e) => e.examType === "HSK")
    .map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      examType: e.examType as string,
      level: e.level,
      duration: e.duration,
      skills: e.skills,
      questionCount: e._count.questions,
      attemptCount: e._count.attempts,
    }));

  const tocflExams = exams
    .filter((e) => e.examType === "TOCFL")
    .map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      examType: e.examType as string,
      level: e.level,
      duration: e.duration,
      skills: e.skills,
      questionCount: e._count.questions,
      attemptCount: e._count.attempts,
    }));

  const tipIndex = new Date().getDate();

  return (
    <ExamClient hskExams={hskExams} tocflExams={tocflExams} tipIndex={tipIndex} />
  );
}
