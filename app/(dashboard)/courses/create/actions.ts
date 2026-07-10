"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { saveCoverImage, extOf } from "@/src/lib/storage";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/src/lib/courses";

const createCourseSchema = z.object({
  title: z.string().trim().min(3, "Tên khoá học phải có ít nhất 3 ký tự").max(120),
  description: z.string().trim().min(10, "Mô tả phải có ít nhất 10 ký tự").max(2000),
  price: z.coerce.number().int().min(0).max(100_000_000),
  category: z.enum(COURSE_CATEGORIES),
  level: z.enum(COURSE_LEVELS),
  subject: z.string().trim().optional(),
});

export type CreateCourseState = { error?: string };

export async function createCourseAction(_prevState: CreateCourseState, formData: FormData): Promise<CreateCourseState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    level: formData.get("level"),
    subject: formData.get("subject") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  let coverImage: string | null = null;
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    coverImage = await saveCoverImage(cover, extOf(cover.name) || ".jpg");
  }

  const course = await prisma.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      level: parsed.data.level,
      subject: parsed.data.subject ?? null,
      coverImage,
      instructorId: session.user.id,
    },
  });

  redirect(`/courses/${course.id}/manage`);
}
