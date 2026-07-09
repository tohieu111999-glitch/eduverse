"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { splitCommission } from "@/src/lib/marketplace";
import { awardAchievement } from "@/src/lib/achievements";

export type PurchaseState = { error?: string; success?: boolean };

export async function purchaseCourseAction(courseId: string): Promise<PurchaseState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập để mua khoá học" };

  const result = await prisma.$transaction(async (tx) => {
    const course = await tx.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== "APPROVED") return { error: "Khoá học không khả dụng" };
    if (course.instructorId === session.user.id) return { error: "Bạn không thể mua khoá học của chính mình" };

    const already = await tx.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId: session.user.id } },
    });
    if (already) return { error: "Bạn đã sở hữu khoá học này" };

    const buyer = await tx.user.findUnique({ where: { id: session.user.id }, select: { coins: true } });
    if (!buyer || buyer.coins < course.price) return { error: "Số dư coins không đủ để mua khoá học này" };

    if (course.price > 0) {
      const { sellerPayout } = splitCommission(course.price);
      await tx.user.update({ where: { id: session.user.id }, data: { coins: { decrement: course.price } } });
      await tx.user.update({ where: { id: course.instructorId }, data: { coins: { increment: sellerPayout } } });
    }

    await tx.courseEnrollment.create({ data: { courseId, userId: session.user.id } });

    return { success: true };
  });

  if (result.success) {
    revalidatePath(`/courses/${courseId}`);
    await awardAchievement(session.user.id, "FIRST_COURSE_ENROLLED");
  }
  return result;
}

export type RatingState = { error?: string };

export async function rateCourseAction(courseId: string, _prevState: RatingState, formData: FormData): Promise<RatingState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId: session.user.id } },
  });
  if (!enrollment) return { error: "Bạn cần học khoá học này trước khi đánh giá" };

  const stars = Number(formData.get("stars"));
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { error: "Số sao không hợp lệ" };
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 1000) || null;

  await prisma.courseRating.upsert({
    where: { courseId_userId: { courseId, userId: session.user.id } },
    create: { courseId, userId: session.user.id, stars, comment },
    update: { stars, comment },
  });

  revalidatePath(`/courses/${courseId}`);
  return {};
}
