"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/admin";
import { logAudit } from "@/src/lib/audit";

export async function setAutoApproveTopupsAction(enabled: boolean) {
  const session = await requireAdmin();
  if (!session) return { error: "Không có quyền truy cập" };

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default", autoApproveTopups: enabled },
    update: { autoApproveTopups: enabled },
  });

  await logAudit({
    actorId: session.user.id,
    action: enabled ? "AUTO_APPROVE_TOPUPS_ENABLED" : "AUTO_APPROVE_TOPUPS_DISABLED",
    targetType: "PlatformSettings",
  });

  revalidatePath("/admin/settings");
  return {};
}
