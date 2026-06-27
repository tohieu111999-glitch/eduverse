import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@prisma/client";

// actorId null means system-triggered (e.g. an auto-approved topup) rather
// than a human admin action — surfaced as "Hệ thống (tự động)" in the UI.
export async function logAudit(entry: {
  actorId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: entry.metadata,
    },
  });
}
