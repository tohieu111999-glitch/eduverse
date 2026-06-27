"use server";

import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { COIN_PACKAGES, generateReference } from "@/src/lib/topup";
import { completeTopup } from "@/src/lib/topup-fulfillment";

export type CreateTopupState = {
  error?: string;
};

export async function createTopupAction(_prevState: CreateTopupState, formData: FormData): Promise<CreateTopupState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const coins = Number(formData.get("coins"));
  const pkg = COIN_PACKAGES.find((p) => p.coins === coins);
  if (!pkg) return { error: "Gói coin không hợp lệ" };

  // Reference codes are random 6-digit suffixes, so collisions are rare but
  // possible — retry a few times rather than surfacing a 500 to the user.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const topup = await prisma.coinTopup.create({
        data: {
          userId: session.user.id,
          coins: pkg.coins,
          amount: pkg.price,
          reference: generateReference(),
        },
      });

      const settings = await prisma.platformSettings.findUnique({ where: { id: "default" } });
      if (settings?.autoApproveTopups) {
        // Trust-based fulfillment with no real bank-payment verification —
        // only safe when the admin has accepted the fraud risk by opting in.
        await completeTopup(topup.id, null);
      }

      redirect(`/topup/${topup.id}`);
    } catch (err) {
      const isUniqueViolation = err instanceof Error && "code" in err && err.code === "P2002";
      if (!isUniqueViolation || attempt === 2) throw err;
    }
  }

  return { error: "Đã xảy ra lỗi, vui lòng thử lại" };
}
