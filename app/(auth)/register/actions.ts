"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { signIn } from "@/src/lib/auth";

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").max(50),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(20)
      .regex(/^[a-z0-9_]+$/, "Chỉ dùng chữ thường, số và gạch dưới"),
    email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    role: z.enum(["USER", "STUDENT", "TEACHER", "SCHOOL_ADMIN"]).default("USER"),
    schoolName: z.string().trim().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "SCHOOL_ADMIN" && !data.schoolName?.trim()) {
      ctx.addIssue({ code: "custom", message: "Vui lòng nhập tên trường/tổ chức", path: ["schoolName"] });
    }
  });

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function registerAction(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || undefined,
    schoolName: formData.get("schoolName") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { displayName, username, email, password, role, schoolName } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    if (existing.email === email) return { error: "Email này đã được sử dụng" };
    return { error: "Tên đăng nhập này đã được sử dụng" };
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { displayName, username, email, password: hashed, name: displayName, role },
  });

  if (role === "SCHOOL_ADMIN" && schoolName) {
    await prisma.school.create({ data: { name: schoolName.trim(), adminId: user.id } });
  }

  await signIn("credentials", {
    identifier: email,
    password,
    redirectTo: "/dashboard",
  });

  return {};
}
