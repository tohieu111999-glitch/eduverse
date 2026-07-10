import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, History, Languages } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import type { DictResult } from "@/src/lib/dictionary";

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return "Vừa xong";
  if (diff < 60) return `${diff} phút trước`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default async function DictionaryHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const history = await prisma.searchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dictionary" className="text-muted hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <History className="h-5 w-5 text-primary" />
          Lịch sử tra từ
        </h1>
      </div>

      {history.length === 0 ? (
        <GlassCard className="p-10 text-center text-muted">
          <History className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">Chưa có lịch sử tra từ nào.</p>
          <Link href="/dictionary" className="mt-3 inline-block text-sm text-primary hover:underline">
            Tra từ ngay →
          </Link>
        </GlassCard>
      ) : (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {history.map((entry) => {
            const r = entry.result as DictResult;
            return (
              <Link
                key={entry.id}
                href={`/dictionary?q=${encodeURIComponent(entry.query)}&dir=${entry.direction}`}
                className="flex items-start justify-between gap-4 rounded-xl px-3 py-3.5 transition hover:bg-foreground/5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{entry.query}</span>
                    {r.pinyin && (
                      <span className="text-xs text-muted">{r.pinyin}</span>
                    )}
                    <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] text-muted">
                      {entry.direction === "CN_TO_VI" ? "CN→VI" : "VI→CN"}
                    </span>
                  </div>
                  {r.meanings?.length > 0 && (
                    <p className="mt-0.5 text-sm text-muted line-clamp-1">
                      {r.meanings.slice(0, 2).join("; ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs text-muted">{timeAgo(entry.createdAt)}</span>
                  <Languages className="h-3.5 w-3.5 text-primary/40" />
                </div>
              </Link>
            );
          })}
        </GlassCard>
      )}
    </div>
  );
}
