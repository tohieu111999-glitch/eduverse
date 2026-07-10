"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { saveCoverImage, saveDocumentFile, extOf } from "@/src/lib/storage";
import { ALLOWED_DOCUMENT_TYPES, MAX_COVER_SIZE_BYTES, MAX_DOCUMENT_SIZE_BYTES } from "@/src/lib/marketplace";

const uploadSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề phải có ít nhất 3 ký tự").max(120),
  description: z.string().trim().min(10, "Mô tả phải có ít nhất 10 ký tự").max(2000),
  category: z.string().trim().min(1, "Vui lòng chọn danh mục"),
  subject: z.string().trim().optional(),
  price: z.coerce.number().int().min(0, "Giá không được âm").max(100_000_000, "Giá tối đa 100.000.000đ"),
});

export type UploadDocumentState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const UPLOAD_LIMITS: Record<string, number> = {
  FREE: 3,
  VIP: 10,
  VIP_PLUS: Infinity,
};

async function checkUploadLimit(userId: string, role: string, vipLevel: string): Promise<string | null> {
  if (role === "TEACHER" || role === "ADMIN" || role === "MODERATOR") return null;

  const limit = UPLOAD_LIMITS[vipLevel] ?? 3;
  if (!isFinite(limit)) return null;

  const count = await prisma.document.count({ where: { sellerId: userId } });
  if (count >= limit) {
    if (vipLevel === "FREE") {
      return `Tài khoản thường chỉ được đăng tối đa ${limit} tài liệu. Nâng cấp VIP để tăng giới hạn.`;
    }
    return `Bạn đã đạt giới hạn ${limit} tài liệu của gói VIP. Nâng cấp VIP+ để đăng không giới hạn.`;
  }
  return null;
}

export async function uploadDocumentAction(
  _prevState: UploadDocumentState,
  formData: FormData,
): Promise<UploadDocumentState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập để đăng bán tài liệu" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vipLevel: true },
  });
  if (!user) return { error: "Không tìm thấy người dùng" };

  const limitError = await checkUploadLimit(session.user.id, user.role, user.vipLevel);
  if (limitError) return { error: limitError };

  const parsed = uploadSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    subject: formData.get("subject") ?? undefined,
    price: formData.get("price"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Vui lòng chọn tài liệu để tải lên" };

  const ext = extOf(file.name);
  if (!ALLOWED_DOCUMENT_TYPES[ext]) {
    return { error: "Chỉ hỗ trợ PDF, Word, Excel, PowerPoint, ZIP" };
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { error: "Tài liệu tối đa 20MB" };
  }

  const cover = formData.get("cover");
  let coverImage: string | null = null;
  if (cover instanceof File && cover.size > 0) {
    if (cover.size > MAX_COVER_SIZE_BYTES) return { error: "Ảnh bìa tối đa 4MB" };
    if (!cover.type.startsWith("image/")) return { error: "Ảnh bìa phải là tệp hình ảnh" };
    coverImage = await saveCoverImage(cover, extOf(cover.name) || ".jpg");
  }

  const storageKey = await saveDocumentFile(file, ext);

  const document = await prisma.document.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      subject: parsed.data.subject ?? null,
      price: parsed.data.price,
      fileUrl: storageKey,
      coverImage,
      sellerId: session.user.id,
    },
  });

  redirect(`/marketplace/${document.id}`);
}
