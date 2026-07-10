import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { extOf } from "@/src/lib/storage";
import { formatVnd } from "@/src/lib/payment";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { BuyButton } from "./buy-button";
import { DocumentPreview } from "@/src/components/document/document-preview";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          displayName: true,
          username: true,
          bankName: true,
          bankBin: true,
          bankAccount: true,
          bankAccountName: true,
        },
      },
    },
  });

  if (!doc) notFound();

  const isOwner = doc.sellerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (doc.status !== "APPROVED" && !isOwner && !isAdmin) notFound();

  const order = await prisma.order.findFirst({
    where: { buyerId: session.user.id, documentId: doc.id, status: { in: ["PAID", "COMPLETED"] } },
  });
  const canDownload = isOwner || isAdmin || Boolean(order);

  const sellerBank =
    doc.seller.bankName && doc.seller.bankBin && doc.seller.bankAccount && doc.seller.bankAccountName
      ? {
          bankName: doc.seller.bankName,
          bankBin: doc.seller.bankBin,
          bankAccount: doc.seller.bankAccount,
          bankAccountName: doc.seller.bankAccountName,
        }
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      <GlassCard className="overflow-hidden p-0">
        <div className="flex h-48 items-center justify-center gradient-cyber">
          {doc.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doc.coverImage} alt={doc.title} className="h-full w-full object-cover" />
          ) : (
            <FileText className="h-14 w-14 text-white" />
          )}
        </div>
        <div className="p-6">
          {doc.status !== "APPROVED" && (
            <span className="mb-3 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
              {doc.status === "PENDING" ? "Đang chờ admin kiểm duyệt" : "Bị từ chối"}
            </span>
          )}
          <span className="text-xs text-accent">
            {doc.subject ? `${doc.subject} · ` : ""}{doc.category}
          </span>
          <h1 className="mt-1 text-2xl font-semibold">{doc.title}</h1>
          <p className="mt-1 text-sm text-muted">
            Người bán: {doc.seller.displayName ?? doc.seller.username ?? "Người dùng EduVerse"}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm">{doc.description}</p>

          <div className="mt-6 flex items-center justify-between text-sm text-muted">
            <span>{doc.downloads} lượt tải</span>
            <span className="text-lg font-bold text-primary">
              {doc.price === 0 ? "Miễn phí" : formatVnd(doc.price)}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {canDownload ? (
              <>
                <Link href={`/api/documents/${doc.id}/download`} className={buttonVariants("primary", "w-full")}>
                  <Download className="h-4 w-4" />
                  Tải xuống
                </Link>
                <DocumentPreview fileUrl={`/api/documents/${doc.id}/download`} ext={extOf(doc.fileUrl)} />
              </>
            ) : (
              <BuyButton documentId={doc.id} price={doc.price} sellerBank={sellerBank} />
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
