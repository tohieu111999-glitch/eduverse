import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, BookOpen, Crown, Flame, Settings, Users2 } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { SearchBar } from "./search-bar";
import { OnlineTimer } from "./online-timer";
import { StreakRewardDialog } from "./streak-reward-dialog";
import { QuestWidget } from "./quest-widget";

// Days of the week (Mon-first, matching Vietnamese abbreviations)
const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

async function getWeekActivity(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const jsDay = today.getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 … Sun=6

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - todayIndex);

  const checkins = await prisma.dailyCheckin.findMany({
    where: { userId, date: { gte: weekStart } },
    select: { date: true },
  });

  const checkinDates = new Set(
    checkins.map((c) => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return checkinDates.has(d.getTime());
  });

  return { weekDays, todayIndex };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, activity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        displayName: true, username: true, avatar: true,
        streak: true, longestStreak: true,
        streak7Claimed: true, streak30Claimed: true,
      },
    }),
    getWeekActivity(session.user.id),
  ]);

  const name = user?.displayName ?? user?.username ?? "Bạn";
  const initial = name.charAt(0).toUpperCase();
  const streak = user?.streak ?? 0;
  const { weekDays, todayIndex } = activity;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* ── 1. GRADIENT HEADER ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-950 via-blue-900 to-indigo-900 p-5 shadow-xl">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 left-6 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-lg font-bold text-white ring-2 ring-white/20">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div>
              <p className="text-xs text-blue-200">Chào mừng trở lại!</p>
              <p className="font-semibold text-white">{name}</p>
            </div>
          </div>
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        <p className="relative mt-4 text-sm text-blue-100">
          Hôm nay bạn muốn học gì? 📖
        </p>
      </div>

      {/* ── 2. TRA TỪ NHANH ────────────────────────────────── */}
      <GlassCard className="p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Tra từ nhanh</h2>
        <SearchBar />
      </GlassCard>

      {/* ── 3. BÀI HỌC AI ──────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Bài học AI</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/learn">
            <GlassCard className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-primary/10">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">Học theo chủ đề</p>
              <p className="mt-1 text-xs text-muted">Nhập chủ đề bất kì — Học theo cách của bạn</p>
            </GlassCard>
          </Link>
          <Link href="/learn">
            <GlassCard className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-accent/10">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <p className="font-semibold">Học theo lộ trình</p>
              <p className="mt-1 text-xs text-muted">Câu chuyện cuốn hút — Tình huống thực tế</p>
            </GlassCard>
          </Link>
        </div>
      </section>

      {/* ── 4. CÁ NHÂN — CHUỖI NGÀY HỌC ───────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Cá nhân</h2>
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Flame className={`h-6 w-6 ${streak > 0 ? "text-orange-500" : "text-muted"}`} />
                <span className="text-2xl font-bold">{streak}</span>
                <span className="text-sm text-muted">ngày liên tiếp</span>
              </div>
              <p className="mt-1 text-xs text-muted">Tra từ để giữ chuỗi</p>
              <p className="mt-0.5 text-xs text-muted">
                <OnlineTimer />
              </p>
            </div>
            <StreakRewardDialog
              streak={streak}
              streak7Claimed={user?.streak7Claimed ?? false}
              streak30Claimed={user?.streak30Claimed ?? false}
            />
          </div>

          {/* 7-day calendar */}
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {WEEK_DAYS.map((day, i) => {
              const isToday = i === todayIndex;
              const isDone = weekDays[i];
              const isFuture = i > todayIndex;
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted"}`}>{day}</span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition
                      ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent" : ""}
                      ${isDone ? "bg-primary text-white" : isFuture ? "bg-foreground/5 text-muted/40" : "bg-foreground/10 text-muted"}`}
                  >
                    {isDone ? "✓" : isFuture ? "·" : "○"}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </section>

      {/* ── 5. NHIỆM VỤ HẰNG NGÀY ─────────────────────────── */}
      <QuestWidget />

      {/* ── 7. TIỆN ÍCH ────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Tiện ích</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dictionary/history">
            <GlassCard className="flex items-center gap-3 p-4 transition hover:-translate-y-0.5">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-semibold">Lịch sử</p>
                <p className="text-xs text-muted">Từ đã tra gần đây</p>
              </div>
            </GlassCard>
          </Link>
          <Link href="/learn">
            <GlassCard className="flex items-center gap-3 p-4 transition hover:-translate-y-0.5">
              <span className="text-2xl">📖</span>
              <div>
                <p className="font-semibold">Từ vựng</p>
                <p className="text-xs text-muted">Thẻ ôn tập & quiz</p>
              </div>
            </GlassCard>
          </Link>
          <Link href="/exam">
            <GlassCard className="flex items-center gap-3 p-4 transition hover:-translate-y-0.5">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold">Thi thử</p>
                <p className="text-xs text-muted">Kiểm tra trình độ</p>
              </div>
            </GlassCard>
          </Link>
          <Link href="/vip">
            <GlassCard className="relative flex items-center gap-3 overflow-hidden p-4 transition hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-linear-to-br from-red-600/20 to-orange-500/10" />
              <Crown className="relative h-7 w-7 text-amber-400" />
              <div className="relative">
                <p className="font-semibold text-amber-400">VIP</p>
                <p className="text-xs text-red-400">Sale 40% — Nâng cấp</p>
              </div>
            </GlassCard>
          </Link>
        </div>
      </section>

      {/* ── 8. CỘNG ĐỒNG ───────────────────────────────────── */}
      <Link href="/community">
        <GlassCard className="flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-primary/10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Users2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Cộng đồng EduVerse</p>
            <p className="mt-0.5 text-xs text-muted">Chia sẻ, hỏi đáp và kết nối với người học</p>
          </div>
          <span className="ml-auto text-sm text-muted">→</span>
        </GlassCard>
      </Link>
    </div>
  );
}
