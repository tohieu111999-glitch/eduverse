import { redirect } from "next/navigation";
import Link from "next/link";
import { Calculator, History, Languages, NotebookText } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { DICT_DIRECTIONS, type DictResult } from "@/src/lib/dictionary";
import { SearchForm } from "./search-form";
import { DictResultCard } from "./dict-result";

export default async function DictionaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dir?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, dir = "CN_TO_VI" } = await searchParams;

  let result: DictResult | null = null;
  if (q) {
    const history = await prisma.searchHistory.findFirst({
      where: { userId: session.user.id, query: q, direction: dir },
      orderBy: { createdAt: "desc" },
      select: { result: true },
    });
    if (history) result = history.result as DictResult;
  }

  const decks = await prisma.flashcardDeck.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const recent = await prisma.searchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, query: true, direction: true },
    distinct: ["query"],
  });

  const dirInfo = DICT_DIRECTIONS[dir as keyof typeof DICT_DIRECTIONS];
  const ttsLang = dirInfo?.ttsLang ?? "zh-CN";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Languages className="h-5 w-5 text-primary" />
          Tra cứu
        </h1>
        <Link
          href="/dictionary/history"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <History className="h-4 w-4" />
          Lịch sử
        </Link>
      </div>

      {/* Quick access: formula + grammar */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/dictionary/formula">
          <GlassCard className="flex items-center gap-3 p-3 transition hover:-translate-y-0.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Calculator className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold">Tra công thức</p>
              <p className="text-xs text-muted">Toán, Lý, Hóa, Sinh...</p>
            </div>
          </GlassCard>
        </Link>
        <Link href="/dictionary/grammar">
          <GlassCard className="flex items-center gap-3 p-3 transition hover:-translate-y-0.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <NotebookText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Tra ngữ pháp</p>
              <p className="text-xs text-muted">Bất kì ngôn ngữ nào</p>
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* Search */}
      <GlassCard className="p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Từ điển đa ngôn ngữ</p>
        <SearchForm defaultQ={q} defaultDir={dir} />
      </GlassCard>

      {/* Result */}
      {q && result ? (
        <DictResultCard result={result} decks={decks} ttsLang={ttsLang} />
      ) : q ? (
        <GlassCard className="p-10 text-center text-muted">
          <p className="text-sm">Đang tra từ... Nếu mất quá lâu, hãy nhấn Tra lại.</p>
        </GlassCard>
      ) : (
        <GlassCard className="p-8 text-center">
          <Languages className="mx-auto mb-3 h-12 w-12 text-primary/30" />
          <p className="font-medium">Nhập từ để tra cứu</p>
          <p className="mt-1 text-sm text-muted">Hỗ trợ Trung · Anh · Nhật · Hàn · Pháp · Việt</p>

          {recent.length > 0 && (
            <div className="mt-5 text-left">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Tra gần đây</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => {
                  const rInfo = DICT_DIRECTIONS[r.direction as keyof typeof DICT_DIRECTIONS];
                  return (
                    <Link
                      key={r.id}
                      href={`/dictionary?q=${encodeURIComponent(r.query)}&dir=${r.direction}`}
                      className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary"
                    >
                      {r.query}
                      <span className="ml-1.5 text-xs text-muted">{rInfo ? `${rInfo.src}→${rInfo.tgt}` : r.direction}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
