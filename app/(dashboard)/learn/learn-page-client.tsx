"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, BookOpenCheck, Crown, Flame, Lock, Plus, Sparkles, Trophy, Zap } from "lucide-react";
import { GlassCard } from "@/src/components/ui/glass-card";
import { VipUpgradeDialog } from "./vip-upgrade-dialog";
import type { DeckCard, SRStats } from "./page";

const SR_LEVELS = [
  { label: "Cấp 1", color: "text-red-400", bg: "bg-red-500/15" },
  { label: "Cấp 2", color: "text-orange-400", bg: "bg-orange-500/15" },
  { label: "Cấp 3", color: "text-yellow-400", bg: "bg-yellow-500/15" },
  { label: "Cấp 4", color: "text-blue-400", bg: "bg-blue-500/15" },
  { label: "Nhớ sâu", color: "text-green-400", bg: "bg-green-500/15" },
];

const LANG_TABS = [
  { key: "all", label: "Tất cả", flag: "🌐" },
  { key: "zh-CN", label: "Tiếng Trung", flag: "🇨🇳" },
  { key: "en-US", label: "Tiếng Anh", flag: "🇬🇧" },
  { key: "ja-JP", label: "Tiếng Nhật", flag: "🇯🇵" },
  { key: "ko-KR", label: "Tiếng Hàn", flag: "🇰🇷" },
] as const;

type LangKey = (typeof LANG_TABS)[number]["key"];

function DeckCardItem({ deck, locked }: { deck: DeckCard; locked?: boolean }) {
  const hasDue = deck.dueCount > 0;

  if (locked) {
    return (
      <VipUpgradeDialog>
        <div className="cursor-pointer">
          <GlassCard className="relative overflow-hidden p-4 opacity-75 transition hover:opacity-100">
            <div className="absolute inset-0 bg-linear-to-br from-amber-600/10 to-yellow-500/5" />
            <div className="relative flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <p className="font-semibold truncate text-sm">{deck.name}</p>
                </div>
                {deck.description && (
                  <p className="mt-0.5 text-xs text-muted line-clamp-1">{deck.description}</p>
                )}
                <p className="mt-2 text-xs text-amber-400 font-medium">
                  <Lock className="inline h-3 w-3 mr-1" />
                  Chỉ dành cho VIP
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </VipUpgradeDialog>
    );
  }

  return (
    <Link href={`/learn/${deck.id}`}>
      <GlassCard className="p-4 transition hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-sm">{deck.name}</p>
            {deck.description && (
              <p className="mt-0.5 text-xs text-muted line-clamp-1">{deck.description}</p>
            )}
          </div>
          {hasDue && (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
              {deck.dueCount} đến hạn
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span>{deck.totalCards} thẻ</span>
          {deck.newCount > 0 && <span className="text-primary">{deck.newCount} mới</span>}
        </div>
      </GlassCard>
    </Link>
  );
}

type Props = {
  personalDecks: DeckCard[];
  freeDecks: DeckCard[];
  vipDecks: DeckCard[];
  srStats: SRStats;
  isVip: boolean;
};

const TABS = ["Sổ tay", "Bài học AI"] as const;
type Tab = (typeof TABS)[number];

export function LearnPageClient({ personalDecks, freeDecks, vipDecks, srStats, isVip }: Props) {
  const [tab, setTab] = useState<Tab>("Sổ tay");
  const [langFilter, setLangFilter] = useState<LangKey>("all");
  const levelCounts = [srStats.l1, srStats.l2, srStats.l3, srStats.l4, srStats.l5];

  function filterByLang(decks: DeckCard[]) {
    if (langFilter === "all") return decks;
    return decks.filter((d) => d.language === langFilter);
  }

  const filteredFree = filterByLang(freeDecks);
  const filteredVip = filterByLang(vipDecks);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* ── HEADER + TABS ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Sổ tay từ vựng</h1>
        </div>
        <Link
          href="/learn/quiz"
          className="flex items-center gap-1.5 rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-medium transition hover:border-accent hover:text-accent"
        >
          <Trophy className="h-3.5 w-3.5" />
          Mini Quiz
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-foreground/10 bg-foreground/5 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition
              ${tab === t ? "glass text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─── TAB: BÀI HỌC AI ──────────────────────────────────── */}
      {tab === "Bài học AI" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/ai">
            <GlassCard className="h-full p-5 transition hover:-translate-y-0.5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">Trợ lý AI</p>
              <p className="mt-1 text-xs text-muted">Học ngôn ngữ với AI — hỏi đáp, giải thích ngữ pháp</p>
            </GlassCard>
          </Link>
          <Link href="/learn/quiz/create">
            <GlassCard className="h-full p-5 transition hover:-translate-y-0.5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <p className="font-semibold">Tạo Quiz AI</p>
              <p className="mt-1 text-xs text-muted">AI tạo bộ câu hỏi trắc nghiệm từ chủ đề bạn chọn</p>
            </GlassCard>
          </Link>
          <Link href="/dictionary">
            <GlassCard className="h-full p-5 transition hover:-translate-y-0.5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              <p className="font-semibold">Từ điển đa ngôn ngữ</p>
              <p className="mt-1 text-xs text-muted">Tra từ có phiên âm, nghĩa, ví dụ, phát âm</p>
            </GlassCard>
          </Link>
          <Link href="/courses">
            <GlassCard className="h-full p-5 transition hover:-translate-y-0.5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <Trophy className="h-5 w-5 text-green-400" />
              </div>
              <p className="font-semibold">Khoá học</p>
              <p className="mt-1 text-xs text-muted">Học theo lộ trình từ giảng viên chuyên nghiệp</p>
            </GlassCard>
          </Link>
        </div>
      )}

      {/* ─── TAB: SỔ TAY ──────────────────────────────────────── */}
      {tab === "Sổ tay" && (
        <>
          {/* SR Widget */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <h2 className="text-sm font-semibold">Spaced Repetition</h2>
            </div>

            {/* Level columns */}
            <div className="grid grid-cols-5 gap-2 text-center">
              {SR_LEVELS.map(({ label, color, bg }, i) => (
                <div key={i} className={`rounded-xl ${bg} py-3`}>
                  <p className={`text-xl font-bold ${color}`}>{levelCounts[i]}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{label}</p>
                </div>
              ))}
            </div>

            {/* Due today banner */}
            {srStats.dueTotal > 0 ? (
              <Link
                href="/learn/review-all"
                className="mt-4 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3 transition hover:bg-primary/20"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    +{srStats.dueTotal} từ vựng cần ôn tập
                  </span>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                  Ôn ngay →
                </span>
              </Link>
            ) : (
              <div className="mt-4 rounded-xl bg-green-500/10 px-4 py-3 text-center text-sm text-green-400">
                ✓ Không có thẻ nào đến hạn hôm nay — bạn đã ôn xong!
              </div>
            )}
          </GlassCard>

          {/* Language filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {LANG_TABS.map(({ key, label, flag }) => (
              <button
                key={key}
                onClick={() => setLangFilter(key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition
                  ${langFilter === key
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-foreground/10 bg-foreground/5 text-muted hover:text-foreground"
                  }`}
              >
                <span>{flag}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Section: Cá nhân */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted">Sổ tay của tôi</h2>
              <Link
                href="/learn/create"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Tạo sổ tay mới
              </Link>
            </div>
            {personalDecks.length === 0 ? (
              <GlassCard className="py-8 text-center text-sm text-muted">
                Chưa có sổ tay nào. Tạo sổ tay đầu tiên của bạn!
              </GlassCard>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {personalDecks.map((deck) => (
                  <DeckCardItem key={deck.id} deck={deck} />
                ))}
              </div>
            )}
          </section>

          {/* Section: Miễn phí */}
          {filteredFree.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted">Miễn phí</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredFree.map((deck) => (
                  <DeckCardItem key={deck.id} deck={deck} />
                ))}
              </div>
            </section>
          )}

          {/* Section: Cao cấp */}
          {filteredVip.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-muted">Cao Cấp</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredVip.map((deck) => (
                  <DeckCardItem key={deck.id} deck={deck} locked={!isVip} />
                ))}
              </div>
            </section>
          )}

          {filteredFree.length === 0 && filteredVip.length === 0 && langFilter !== "all" && (
            <GlassCard className="py-8 text-center text-sm text-muted">
              Chưa có bộ thẻ {LANG_TABS.find((t) => t.key === langFilter)?.label} nào.
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
