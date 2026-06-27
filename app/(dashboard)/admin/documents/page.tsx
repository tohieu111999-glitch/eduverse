import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { ModerationActions } from "./moderation-actions";

export default async function AdminDocumentsPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const pending = await prisma.document.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { seller: { select: { displayName: true, username: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Kiểm duyệt tài liệu</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quản trị
        </Link>
      </div>

      {pending.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Không có tài liệu nào đang chờ duyệt.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((doc) => (
            <GlassCard key={doc.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-cyber">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{doc.title}</h3>
                    <span className="text-sm font-bold text-primary">{doc.price} coins</span>
                  </div>
                  <p className="text-xs text-muted">
                    {doc.category} · Người bán: {doc.seller.displayName ?? doc.seller.username}
                  </p>
                  <p className="mt-2 text-sm">{doc.description}</p>
                  <div className="mt-4">
                    <ModerationActions documentId={doc.id} />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
