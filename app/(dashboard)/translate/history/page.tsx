import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";

const LANG_LABELS: Record<string, string> = {
  vi: "🇻🇳 Việt",
  "zh-CN": "🇨🇳 Trung (Giản)",
  "zh-TW": "🇹🇼 Trung (Phồn)",
  en: "🇬🇧 Anh",
  ja: "🇯🇵 Nhật",
  ko: "🇰🇷 Hàn",
  fr: "🇫🇷 Pháp",
  de: "🇩🇪 Đức",
  es: "🇪🇸 Tây Ban Nha",
};

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

export default async function TranslateHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const history = await prisma.translateHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/translate" className="text-muted transition hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted" />
          <h1 className="text-xl font-semibold">Lịch sử dịch</h1>
        </div>
      </div>

      {history.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted opacity-50" />
          <p className="text-sm text-muted">Chưa có lịch sử dịch nào.</p>
          <Link
            href="/translate"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Bắt đầu dịch →
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <GlassCard key={item.id} className="space-y-3 p-4">
              {/* Lang pair + time */}
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  {LANG_LABELS[item.sourceLang] ?? item.sourceLang}
                  {" → "}
                  {LANG_LABELS[item.targetLang] ?? item.targetLang}
                </span>
                <span>{timeAgo(item.createdAt)}</span>
              </div>

              {/* Source text */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted/70 mb-1">
                  Văn bản gốc
                </p>
                <p className="text-sm text-foreground/80 line-clamp-3 whitespace-pre-wrap">
                  {item.sourceText}
                </p>
              </div>

              {/* Translation */}
              <div className="rounded-xl bg-foreground/5 px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted/70 mb-1">
                  Bản dịch
                </p>
                <p className="text-sm line-clamp-3 whitespace-pre-wrap">{item.targetText}</p>
              </div>

              {/* Pinyin */}
              {item.pinyin && (
                <p className="text-xs text-muted italic">{item.pinyin}</p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
