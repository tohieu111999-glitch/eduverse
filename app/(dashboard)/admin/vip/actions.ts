"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";

export type VipConfigState = { error?: string; success?: boolean };

export async function saveVipConfigAction(
  _prev: VipConfigState,
  formData: FormData,
): Promise<VipConfigState> {
  const session = await requireAdmin();
  if (!session) return { error: "Không có quyền truy cập" };

  const monthlyCoins = parseInt(String(formData.get("monthlyCoins") ?? "600"), 10);
  const yearlyCoins = parseInt(String(formData.get("yearlyCoins") ?? "4320"), 10);
  const lifetimeCoins = parseInt(String(formData.get("lifetimeCoins") ?? "9999"), 10);

  if ([monthlyCoins, yearlyCoins, lifetimeCoins].some((n) => isNaN(n) || n < 1)) {
    return { error: "Giá coins phải là số nguyên dương" };
  }

  await prisma.vipConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", monthlyCoins, yearlyCoins, lifetimeCoins },
    update: { monthlyCoins, yearlyCoins, lifetimeCoins },
  });

  revalidatePath("/vip");
  revalidatePath("/admin/vip");
  return { success: true };
}
