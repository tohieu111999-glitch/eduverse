import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { resolveDocumentPath, extOf } from "@/src/lib/storage";
import { ALLOWED_DOCUMENT_TYPES } from "@/src/lib/marketplace";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = doc.sellerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    const order = await prisma.order.findFirst({
      where: { buyerId: session.user.id, documentId: doc.id, status: "COMPLETED" },
    });
    if (!order) return NextResponse.json({ error: "Bạn chưa mua tài liệu này" }, { status: 403 });
  }

  try {
    const buffer = await readFile(resolveDocumentPath(doc.fileUrl));
    const ext = extOf(doc.fileUrl);
    const contentType = ALLOWED_DOCUMENT_TYPES[ext] ?? "application/octet-stream";
    const filename = encodeURIComponent(`${doc.title}${ext}`);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Tệp không tồn tại" }, { status: 404 });
  }
}
