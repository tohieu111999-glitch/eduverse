import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BookOpenCheck,
  Coins,
  Crown,
  ExternalLink,
  FileText,
  Flame,
  GraduationCap,
  Lock,
  PenLine,
  Settings,
  ShoppingBag,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { isVip } from "@/src/lib/vip";
import { GlassCard } from "@/src/components/ui/glass-card";
import { ExpBar } from "@/src/components/dashboard/exp-bar";
import { ACHIEVEMENTS, type AchievementCode } from "@/src/lib/achievements";
import { ShareButton, FeedbackSection, RateButton, LogoutButton, SupportCard } from "./profile-client";

// ── Icon map (same as AchievementBadge) ───────────────────
const ICONS: Record<string, LucideIcon> = {
  FileText, PenLine, ShoppingBag, BookOpenCheck, Coins, Users, Trophy, Crown, Flame, GraduationCap, Award,
};

// ── Achievement display order + progress hints ─────────────
const ACHIEVEMENT_ORDER: AchievementCode[] = [
  "STREAK_7", "STREAK_30", "STREAK_100",
  "FIRST_POST", "TEN_POSTS",
  "FIRST_REVIEW", "FIRST_QUIZ",
  "FIRST_PURCHASE", "FIRST_SALE", "FIRST_TOPUP",
  "FIRST_SERVER",
  "FIRST_COURSE_ENROLLED", "FIRST_COURSE_COMPLETED", "FIRST_COURSE_PUBLISHED",
  "LEVEL_10", "LEVEL_20", "LEVEL_50", "LEVEL_100",
];

function getProgress(
  code: AchievementCode,
  stats: { streak: number; level: number; postCount: number },
): [number, number] {
  switch (code) {
    case "STREAK_7":   return [Math.min(stats.streak, 7), 7];
    case "STREAK_30":  return [Math.min(stats.streak, 30), 30];
    case "STREAK_100": return [Math.min(stats.streak, 100), 100];
    case "FIRST_POST": return [Math.min(stats.postCount, 1), 1];
    case "TEN_POSTS":  return [Math.min(stats.postCount, 10), 10];
    case "LEVEL_10":   return [Math.min(stats.level, 10), 10];
    case "LEVEL_20":   return [Math.min(stats.level, 20), 20];
    case "LEVEL_50":   return [Math.min(stats.level, 50), 50];
    case "LEVEL_100":  return [Math.min(stats.level, 100), 100];
    default:           return [0, 1];
  }
}

export default async function OwnProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatar: true,
      level: true,
      exp: true,
      vipLevel: true,
      vipExpiresAt: true,
      streak: true,
      _count: { select: { posts: true } },
    },
  });
  if (!user) redirect("/login");

  const earnedList = await prisma.userAchievement.findMany({
    where: { userId: user.id },
    include: { achievement: true },
  });
  const earnedCodes = new Set(earnedList.map((ua) => ua.achievement.code));

  const name = user.displayName ?? user.username ?? "Bạn";
  const initial = name.charAt(0).toUpperCase();
  const showVip = isVip(user);
  const stats = { streak: user.streak, level: user.level, postCount: user._count.posts };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {/* ── Tài khoản ──────────────────────────────────────── */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full gradient-cyber text-xl font-semibold text-white">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={name} className="h-full w-full object-cover" />
            ) : initial}
            {showVip && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-background">
                <Crown className="h-3 w-3 text-white" />
              </span>
            )}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-semibold">{name}</h1>
              {showVip && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {user.vipLevel === "VIP_PLUS" ? "VIP+" : "VIP"}
                </span>
              )}
            </div>
            {user.username && (
              <p className="text-xs text-muted">@{user.username}</p>
            )}
          </div>

          <Link
            href="/settings"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground/10 text-muted transition hover:border-primary hover:text-primary"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        <ExpBar level={user.level} exp={user.exp} />
      </GlassCard>

      {/* ── Giới thiệu (VIP promo or VIP status) ──────────── */}
      {showVip ? (
        <GlassCard className="p-5 space-y-2">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-400">
                {user.vipLevel === "VIP_PLUS" ? "VIP+" : "VIP"} đang hoạt động
              </p>
              {user.vipExpiresAt && (
                <p className="text-xs text-muted">
                  Hết hạn: {new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(user.vipExpiresAt)}
                </p>
              )}
            </div>
          </div>
          <Link href="/policy" className="text-xs text-muted hover:underline">
            Chính sách & Điều khoản
          </Link>
        </GlassCard>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-red-950 via-red-900 to-orange-900 p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-500/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 left-4 h-20 w-20 rounded-full bg-red-500/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <p className="text-sm font-semibold text-amber-400">EduVerse VIP</p>
            </div>
            <p className="text-sm text-white/80 mb-3">
              Mở khoá tất cả tính năng cao cấp: không giới hạn dịch văn bản, truy cập tài liệu VIP, ưu tiên AI...
            </p>
            <div className="flex items-center justify-between">
              <Link
                href="/vip"
                className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                Nâng cấp ngay →
              </Link>
              <Link href="/policy" className="text-xs text-white/50 hover:text-white/80 hover:underline">
                Chính sách & Điều khoản
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Thành tích ─────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Thành tích</h2>
          <span className="text-xs text-muted">{earnedCodes.size}/{ACHIEVEMENT_ORDER.length}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {ACHIEVEMENT_ORDER.map((code) => {
            const def = ACHIEVEMENTS[code];
            const earned = earnedCodes.has(code);
            const [current, total] = getProgress(code, stats);
            const percent = total > 0 ? Math.round((current / total) * 100) : 0;
            const Icon = ICONS[def.icon] ?? Trophy;

            return (
              <div
                key={code}
                className={`flex shrink-0 w-32 flex-col items-center gap-2 rounded-2xl border p-3 text-center transition
                  ${earned
                    ? "border-primary/30 bg-primary/5"
                    : "border-foreground/10 bg-foreground/3 opacity-70"
                  }`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl
                  ${earned ? "gradient-cyber" : "bg-foreground/10"}`}>
                  {earned
                    ? <Icon className="h-5 w-5 text-white" />
                    : <Lock className="h-4 w-4 text-muted" />
                  }
                </span>
                <p className="text-[11px] font-semibold leading-tight line-clamp-2">{def.name}</p>
                {/* Progress bar */}
                <div className="w-full">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className={`h-full rounded-full transition-all ${earned ? "gradient-cyber" : "bg-foreground/20"}`}
                      style={{ width: `${earned ? 100 : percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">
                    {earned ? "Đã đạt" : total === 1 ? "Chưa đạt" : `${current}/${total}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Hỗ trợ chúng mình ─────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold">Hỗ trợ chúng mình</h2>
        <SupportCard>
          <ShareButton />
          <FeedbackSection />
          <RateButton />
        </SupportCard>
      </section>

      {/* ── Khác ───────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold">Khác</h2>
        <GlassCard className="px-2 py-1 divide-y divide-foreground/8">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-3 px-2 py-3 text-sm transition hover:bg-foreground/5 rounded-xl"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ExternalLink className="h-4 w-4" />
            </span>
            <div className="flex-1 text-left">
              <p className="font-medium">Phiên bản web</p>
              <p className="text-xs text-muted">EduVerse v1.0 · Mở trong tab mới</p>
            </div>
          </a>
          <LogoutButton />
        </GlassCard>
      </section>
    </div>
  );
}
