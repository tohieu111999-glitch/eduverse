"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Eye } from "lucide-react";
import { Button } from "@/src/components/ui/button";

// react-pdf relies on browser-only APIs (Worker, canvas) — must be loaded
// client-side only, and only inside a Client Component per Next.js' rules
// (`ssr: false` is rejected if used directly in a Server Component).
const PdfViewer = dynamic(() => import("./pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => <p className="py-8 text-center text-sm text-muted">Đang tải trình xem PDF...</p>,
});

export function DocumentPreview({ fileUrl, ext }: { fileUrl: string; ext: string }) {
  const [open, setOpen] = useState(false);

  if (ext !== ".pdf") {
    return <p className="text-xs text-muted">Xem trước trong trình duyệt chỉ hỗ trợ file PDF. Hãy tải xuống để xem.</p>;
  }

  if (!open) {
    return (
      <Button variant="glass" onClick={() => setOpen(true)} className="w-full">
        <Eye className="h-4 w-4" />
        Xem trước & tra từ
      </Button>
    );
  }

  return <PdfViewer fileUrl={fileUrl} />;
}
