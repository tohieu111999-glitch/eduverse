"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { generatePaymentRef } from "@/src/lib/payment";
import { awardAchievement } from "@/src/lib/achievements";

export async function createCourseOrderAction(
  courseId: string,
): Promise<{ orderId: string; paymentRef: string } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "APPROVED" },
    select: { instructorId: true, price: true },
  });
  if (!course) return { error: "Không tìm thấy khoá học" };
  if (course.instructorId === session.user.id) return { error: "Bạn không thể mua khoá học của chính mình" };

  const already = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId: session.user.id } },
  });
  if (already) return { error: "Bạn đã đăng ký khoá học này" };

  if (course.price === 0) {
    await prisma.courseEnrollment.create({ data: { courseId, userId: session.user.id } });
    await prisma.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: course.instructorId,
        courseId,
        amountVnd: 0,
        status: "PAID",
        paidAt: new Date(),
      },
    });
    revalidatePath(`/courses/${courseId}`);
    await awardAchievement(session.user.id, "FIRST_COURSE_ENROLLED");
    return { orderId: "free", paymentRef: "FREE" };
  }

  const paymentRef = generatePaymentRef("CRS");
  const order = await prisma.order.create({
    data: {
      buyerId: session.user.id,
      sellerId: course.instructorId,
      courseId,
      amountVnd: course.price,
      paymentRef,
      status: "PENDING",
    },
  });

  return { orderId: order.id, paymentRef };
}

export async function confirmCoursePaymentAction(
  orderId: string,
): Promise<{ success: boolean } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true, status: true, courseId: true },
  });

  if (!order) return { error: "Không tìm thấy đơn hàng" };
  if (order.buyerId !== session.user.id) return { error: "Không có quyền truy cập" };
  if (order.status !== "PENDING") return { error: "Đơn hàng đã được xử lý" };
  if (!order.courseId) return { error: "Đơn hàng không hợp lệ" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paidAt: new Date() },
  });

  await prisma.courseEnrollment.create({
    data: { courseId: order.courseId, userId: session.user.id },
  });

  revalidatePath(`/courses/${order.courseId}`);
  await awardAchievement(session.user.id, "FIRST_COURSE_ENROLLED");

  return { success: true };
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
