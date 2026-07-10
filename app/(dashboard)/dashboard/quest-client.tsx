"use client";

import { useState } from "react";
import {
  BookOpenCheck,
  Check,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { claimQuestRewardAction } from "./quest-actions";

const ICONS: Record<string, LucideIcon> = {
  BookOpenCheck, Trophy, FileText, MessageSquare, Clock, Zap,
};

type QuestRow = {
  quest: {
    id: string;
    title: string;
    description: string;
    target: number;
    expReward: number;
    coinReward: number;
    icon: string;
  };
  progress: {
    id: string;
    progress: number;
    completed: boolean;
    claimedAt: Date | null;
  } | null;
};

const CONFETTI_COLORS = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

function Confetti() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${(i / 60) * 100 + Math.sin(i) * 15}%`,
    delay: `${(i % 10) * 0.05}s`,
    dur: `${0.9 + (i % 5) * 0.15}s`,
    size: `${4 + (i % 4) * 2}px`,
    rotate: `${i * 43}deg`,
  }));

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: 0,
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: "2px",
              animation: `confettiFall ${p.dur} ${p.delay} ease-in forwards`,
              transform: `rotate(${p.rotate})`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export function QuestClient({ rows }: { rows: QuestRow[] }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [localRows, setLocalRows] = useState(rows);

  const completedCount = localRows.filter((r) => r.progress?.completed).length;
  const claimedCount = localRows.filter((r) => r.progress?.claimedAt != null).length;

  async function handleClaim(questId: string) {
    setClaiming(questId);
    const result = await claimQuestRewardAction(questId);
    setClaiming(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Optimistic update
    setLocalRows((prev) =>
      prev.map((r) =>
        r.quest.id === questId && r.progress
          ? { ...r, progress: { ...r.progress, claimedAt: new Date() } }
          : r,
      ),
    );

    const parts = [];
    if (result.expGained) parts.push(`+${result.expGained} EXP`);
    if (result.coinsGained) parts.push(`+${result.coinsGained} coins`);
    toast.success(`${parts.join(" ")} đã nhận! 🎉`);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    if (result.allComplete) {
      setTimeout(() => {
        toast("🏆 Tuyệt vời! Hoàn thành tất cả nhiệm vụ! +20 coins thưởng!", {
          duration: 5000,
          icon: "🎊",
        });
      }, 600);
    }
  }

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="space-y-2">
        {/* Header summary */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-muted">
            {claimedCount}/{localRows.length} đã nhận thưởng
          </p>
          {completedCount === localRows.length && claimedCount === localRows.length && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Hoàn thành hôm nay! 🎉
            </span>
          )}
        </div>

        {localRows.map(({ quest, progress }) => {
          const Icon = ICONS[quest.icon] ?? Trophy;
          const cur = Math.min(progress?.progress ?? 0, quest.target);
          const pct = Math.round((cur / quest.target) * 100);
          const done = progress?.completed ?? false;
          const claimed = progress?.claimedAt != null;

          return (
            <div
              key={quest.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition
                ${claimed
                  ? "border-foreground/5 bg-foreground/3 opacity-60"
                  : done
                  ? "border-primary/25 bg-primary/5"
                  : "border-foreground/10 bg-foreground/4"
                }`}
            >
              {/* Icon */}
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                ${claimed ? "bg-foreground/8" : done ? "bg-primary/15" : "bg-foreground/8"}`}>
                {claimed
                  ? <Check className="h-4 w-4 text-green-400" />
                  : <Icon className={`h-4 w-4 ${done ? "text-primary" : "text-muted"}`} />
                }
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium ${claimed ? "line-through text-muted" : ""}`}>
                    {quest.title}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted">
                    {quest.expReward > 0 && `+${quest.expReward} EXP`}
                    {quest.coinReward > 0 && ` +${quest.coinReward} coins`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className={`h-full rounded-full transition-all ${done ? "bg-primary" : "bg-foreground/25"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[10px] text-muted">
                    {cur}/{quest.target}
                  </span>
                </div>
              </div>

              {/* Claim button */}
              {done && !claimed && (
                <button
                  type="button"
                  disabled={claiming === quest.id}
                  onClick={() => handleClaim(quest.id)}
                  className="shrink-0 flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {claiming === quest.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : "Nhận thưởng"
                  }
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
