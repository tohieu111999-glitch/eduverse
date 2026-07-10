"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Coins, Flame, Gift, X } from "lucide-react";
import { claimStreakRewardAction } from "./streak-reward-actions";

type Props = {
  streak: number;
  streak7Claimed: boolean;
  streak30Claimed: boolean;
};

type Milestone = { days: 7 | 30; coins: number; label: string };

const MILESTONES: Milestone[] = [
  { days: 7, coins: 50, label: "Chuỗi 7 ngày" },
  { days: 30, coins: 300, label: "Chuỗi 30 ngày" },
];

export function StreakRewardDialog({ streak, streak7Claimed, streak30Claimed }: Props) {
  const [open, setOpen] = useState(false);
  const [claimed, setClaimed] = useState<Record<number, boolean>>({
    7: streak7Claimed,
    30: streak30Claimed,
  });
  const [justClaimed, setJustClaimed] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const canClaim7 = streak >= 7 && !claimed[7];
  const canClaim30 = streak >= 30 && !claimed[30];
  const hasAnyReward = canClaim7 || canClaim30;

  function handleClaim(milestone: 7 | 30) {
    setError("");
    startTransition(async () => {
      const res = await claimStreakRewardAction(milestone);
      if (res.error) {
        setError(res.error);
      } else {
        setClaimed((prev) => ({ ...prev, [milestone]: true }));
        setJustClaimed(milestone);
        setTimeout(() => setJustClaimed(null), 2000);
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition
            ${hasAnyReward
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 ring-2 ring-amber-400/50"
              : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            }`}
          aria-label="Phần thưởng chuỗi ngày"
        >
          <Gift className="h-5 w-5" />
          {hasAnyReward && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[7px] font-bold text-white">
              !
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="glass fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="flex items-center gap-2 font-semibold">
              <Gift className="h-5 w-5 text-amber-400" />
              Phần thưởng chuỗi ngày
            </Dialog.Title>
            <Dialog.Close className="text-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Current streak display */}
          <div className="mb-5 flex items-center justify-center gap-3 rounded-2xl bg-orange-500/10 py-4">
            <Flame className={`h-8 w-8 ${streak > 0 ? "text-orange-500" : "text-muted"}`} />
            <div className="text-center">
              <p className="text-3xl font-bold">{streak}</p>
              <p className="text-xs text-muted">ngày liên tiếp</p>
            </div>
          </div>

          <div className="space-y-3">
            {MILESTONES.map(({ days, coins, label }) => {
              const isClaimed = claimed[days];
              const isUnlocked = streak >= days;
              const isJust = justClaimed === days;

              return (
                <div
                  key={days}
                  className={`flex items-center justify-between rounded-xl border p-4 transition
                    ${isUnlocked ? "border-amber-400/30 bg-amber-500/5" : "border-foreground/10 opacity-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full
                      ${isClaimed ? "bg-green-500/10 text-green-400" : isUnlocked ? "bg-amber-500/15 text-amber-400" : "bg-foreground/10 text-muted"}`}>
                      {isClaimed ? <Check className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <Coins className="h-3 w-3 text-amber-400" />
                        <span>{coins} xu</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(days)}
                    disabled={pending || isClaimed || !isUnlocked}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition
                      ${isClaimed
                        ? "bg-green-500/10 text-green-400 cursor-default"
                        : isUnlocked
                        ? "bg-amber-500 text-white hover:opacity-90 disabled:opacity-50"
                        : "bg-foreground/10 text-muted cursor-default"
                      }`}
                  >
                    {isJust ? "✓ Nhận rồi!" : isClaimed ? "Đã nhận" : isUnlocked ? "Nhận ngay" : `Cần ${days} ngày`}
                  </button>
                </div>
              );
            })}
          </div>

          {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}

          <p className="mt-4 text-center text-[11px] text-muted">
            Giữ chuỗi mỗi ngày bằng cách tra từ, ôn tập hoặc làm quiz
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
