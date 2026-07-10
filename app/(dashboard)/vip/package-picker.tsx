"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Loader2 } from "lucide-react";
import { purchaseVipAction, type PurchaseVipState } from "./actions";
import type { VipPackage } from "@/src/lib/vip";

const initialState: PurchaseVipState = {};

export function VipPackagePicker({
  packages,
  userCoins,
  isVip,
}: {
  packages: readonly VipPackage[];
  userCoins: number;
  isVip: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(packages[1].key);
  const [state, formAction, pending] = useActionState(purchaseVipAction, initialState);

  const selectedPkg = packages.find((p) => p.key === selected) ?? packages[0];
  const hasEnough = userCoins >= selectedPkg.coins;

  function handlePurchase() {
    if (!hasEnough) {
      router.push("/topup");
    }
  }

  return (
    <div className="space-y-4">
      {/* Package cards */}
      <div className="grid grid-cols-3 gap-3">
        {packages.map((pkg) => {
          const on = selected === pkg.key;
          const isLifetime = pkg.days === 0;
          return (
            <button
              key={pkg.key}
              type="button"
              onClick={() => setSelected(pkg.key)}
              className={`relative rounded-2xl border p-3 text-center transition
                ${on
                  ? "border-amber-500/60 bg-amber-500/10 shadow-[0_0_16px_rgba(245,158,11,0.2)]"
                  : "border-foreground/10 bg-foreground/4 hover:border-foreground/20"
                }`}
            >
              {pkg.badge && (
                <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold
                  ${isLifetime
                    ? "bg-primary text-white"
                    : "bg-red-500 text-white"
                  }`}>
                  {pkg.badge}
                </span>
              )}
              <p className={`mt-1 text-sm font-semibold ${on ? "text-amber-400" : ""}`}>{pkg.label}</p>
              <p className={`mt-0.5 text-xl font-bold ${on ? "text-amber-300" : "text-foreground"}`}>
                {pkg.coins.toLocaleString("vi-VN")}
              </p>
              <p className="text-[10px] text-muted">coins</p>
              {pkg.perDay && (
                <p className="mt-1 text-[10px] text-muted">{pkg.perDay} coins/ngày</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Error from action */}
      {state.error && !state.insufficientCoins && (
        <p className="text-center text-sm text-red-400">{state.error}</p>
      )}

      {/* Action button */}
      {hasEnough ? (
        <form action={formAction}>
          <input type="hidden" name="key" value={selected} />
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-amber-500 to-red-500 py-3.5 text-base font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Crown className="h-5 w-5" />
            )}
            {pending
              ? "Đang xử lý..."
              : isVip
              ? `Gia hạn — ${selectedPkg.coins.toLocaleString("vi-VN")} coins`
              : `Nâng cấp VIP — ${selectedPkg.coins.toLocaleString("vi-VN")} coins`}
          </button>
        </form>
      ) : (
        <a
          href="/topup"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/40 py-3.5 text-base font-semibold text-amber-400 transition hover:bg-amber-500/10"
        >
          Nạp coins để mua → cần thêm {(selectedPkg.coins - userCoins).toLocaleString("vi-VN")} coins
        </a>
      )}
    </div>
  );
}
