"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

export type ResetState = { error?: string; success?: boolean };

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!token) return { error: "Token không hợp lệ" };
  if (!password || password.length < 6) return { error: "Mật khẩu phải có ít nhất 6 ký tự" };
  if (password !== confirm) return { error: "Mật khẩu xác nhận không khớp" };

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return { error: "Link đặt lại không hợp lệ hoặc đã được dùng" };
  if (record.expires < new Date()) return { error: "Link đã hết hạn. Vui lòng yêu cầu lại." };

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: record.email },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return { success: true };
}
