import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";

export default async function MarketplacePage() {
  const documents = await prisma.document.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { displayName: true, username: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Chợ tài liệu</h1>
          <p className="text-sm text-muted">Mua và bán tài liệu học tập bằng coins.</p>
        </div>
        <Link href="/marketplace/upload" className={buttonVariants("primary")}>
          <Plus className="h-4 w-4" />
          Đăng bán
        </Link>
      </div>

      {documents.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          Chưa có tài liệu nào được duyệt. Hãy là người đầu tiên đăng bán!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/marketplace/${doc.id}`}>
              <GlassCard className="h-full overflow-hidden p-0 transition hover:-translate-y-0.5">
                <div className="flex h-32 items-center justify-center gradient-cyber">
                  {doc.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doc.coverImage} alt={doc.title} className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs text-accent">{doc.category}</span>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{doc.title}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {doc.seller.displayName ?? doc.seller.username ?? "Người bán"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">{doc.price} coins</span>
                    <span className="text-xs text-muted">{doc.downloads} lượt tải</span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
