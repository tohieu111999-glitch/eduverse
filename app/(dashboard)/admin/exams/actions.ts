"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";

export async function createExamAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const skills: string[] = [];
  if (formData.get("skill_LISTENING")) skills.push("LISTENING");
  if (formData.get("skill_READING")) skills.push("READING");

  await prisma.exam.create({
    data: {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      examType: String(formData.get("examType") ?? "HSK") as "HSK" | "TOCFL" | "JLPT" | "TOPIK" | "CUSTOM",
      level: String(formData.get("level") ?? "").trim(),
      duration: parseInt(String(formData.get("duration") ?? "40"), 10),
      skills,
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/admin/exams");
  revalidatePath("/exam");
}

export async function deleteExamAction(examId: string): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  await prisma.exam.delete({ where: { id: examId } });
  revalidatePath("/admin/exams");
  revalidatePath("/exam");
}

export async function toggleExamActiveAction(examId: string, isActive: boolean): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  await prisma.exam.update({ where: { id: examId }, data: { isActive } });
  revalidatePath("/admin/exams");
  revalidatePath("/exam");
}
