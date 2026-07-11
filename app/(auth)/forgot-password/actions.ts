"use server";

import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";
import { sendPasswordResetEmail } from "@/src/lib/email";

export type ForgotState = { error?: string; success?: boolean };

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Vui lòng nhập email" };

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  // Always return success to avoid email enumeration
  if (!user) return { success: true };

  // Delete old tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({ data: { email, token, expires } });

  try {
    await sendPasswordResetEmail(email, token);
  } catch {
    return { error: "Không thể gửi email. Vui lòng thử lại sau." };
  }

  return { success: true };
}
