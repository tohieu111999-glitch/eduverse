"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/admin";
import { logAudit } from "@/src/lib/audit";

export type ModerateState = { error?: string };

export async function moderateDocumentAction(documentId: string, decision: "APPROVED" | "REJECTED"): Promise<ModerateState> {
  const session = await requireAdmin();
  if (!session) return { error: "Không có quyền truy cập" };

  await prisma.document.update({ where: { id: documentId }, data: { status: decision } });
  await logAudit({
    actorId: session.user.id,
    action: decision === "APPROVED" ? "DOCUMENT_APPROVED" : "DOCUMENT_REJECTED",
    targetType: "Document",
    targetId: documentId,
  });

  revalidatePath("/admin/documents");
  revalidatePath("/marketplace");
  return {};
}
