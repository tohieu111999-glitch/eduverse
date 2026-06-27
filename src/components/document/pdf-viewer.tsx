"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TranslateLookup } from "@/src/components/translate/translate-lookup";

// Must be set in this same module (not a shared setup file) per react-pdf's
// docs, since module execution order can otherwise let a later import reset
// it back to the default.
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [width, setWidth] = useState(700);

  useEffect(() => {
    if (containerRef.current) setWidth(Math.min(700, containerRef.current.clientWidth - 4));
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} className="w-full max-w-3xl">
        <TranslateLookup className="overflow-auto rounded-xl border border-foreground/10">
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p className="p-8 text-center text-sm text-muted">Đang tải PDF...</p>}
            error={<p className="p-8 text-center text-sm text-red-500">Không thể tải file PDF.</p>}
          >
            <Page pageNumber={pageNumber} width={width} />
          </Document>
        </TranslateLookup>
      </div>

      {numPages && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="rounded-full p-2 hover:bg-foreground/5 disabled:opacity-30"
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted">
            Trang {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="rounded-full p-2 hover:bg-foreground/5 disabled:opacity-30"
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      <p className="text-center text-xs text-muted">Bôi đen từ/câu trong tài liệu để dịch nhanh.</p>
    </div>
  );
}
