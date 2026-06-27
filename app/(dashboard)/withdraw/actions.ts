"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { VND_PER_COIN } from "@/src/lib/topup";

const MIN_WITHDRAW_COINS = 100;

const withdrawSchema = z.object({
  coins: z.coerce.number().int().min(MIN_WITHDRAW_COINS, `Tối thiểu ${MIN_WITHDRAW_COINS} coin mỗi lần rút`),
  bankName: z.string().trim().min(2, "Vui lòng nhập tên ngân hàng").max(100),
  bankAccountNumber: z
    .string()
    .trim()
    .min(4, "Số tài khoản không hợp lệ")
    .max(30)
    .regex(/^[0-9]+$/, "Số tài khoản chỉ gồm chữ số"),
  bankAccountName: z.string().trim().min(2, "Vui lòng nhập tên chủ tài khoản").max(100),
});

export type RequestWithdrawalState = { error?: string };

export async function requestWithdrawalAction(
  _prevState: RequestWithdrawalState,
  formData: FormData,
): Promise<RequestWithdrawalState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const parsed = withdrawSchema.safeParse({
    coins: formData.get("coins"),
    bankName: formData.get("bankName"),
    bankAccountNumber: formData.get("bankAccountNumber"),
    bankAccountName: formData.get("bankAccountName"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: session.user.id }, select: { coins: true } });
    if (!user || user.coins < parsed.data.coins) return { error: "Số dư coin không đủ" };

    // Held immediately (escrow) so the same coins can't also be spent
    // elsewhere while the request is pending admin review.
    await tx.user.update({ where: { id: session.user.id }, data: { coins: { decrement: parsed.data.coins } } });
    await tx.withdrawal.create({
      data: {
        userId: session.user.id,
        coins: parsed.data.coins,
        amountVnd: parsed.data.coins * VND_PER_COIN,
        bankName: parsed.data.bankName,
        bankAccountNumber: parsed.data.bankAccountNumber,
        bankAccountName: parsed.data.bankAccountName,
      },
    });
    return {};
  });

  if (!result.error) revalidatePath("/withdraw");
  return result;
}
