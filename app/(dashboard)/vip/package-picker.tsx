"use client";

import { useActionState, useState } from "react";
import { purchaseVipAction, type PurchaseVipState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { VIP_PACKAGES } from "@/src/lib/vip";

const initialState: PurchaseVipState = {};

export function VipPackagePicker() {
  const [selected, setSelected] = useState<number>(VIP_PACKAGES[1].days);
  const [state, formAction, pending] = useActionState(purchaseVipAction, initialState);

  return (
    <form action={formAction}>
      <div className="grid grid-cols-3 gap-3">
        {VIP_PACKAGES.map((pkg) => (
          <button
            key={pkg.days}
            type="button"
            onClick={() => setSelected(pkg.days)}
            className={`rounded-xl border p-4 text-center transition ${
              selected === pkg.days
                ? "border-primary bg-primary/10"
                : "border-foreground/10 bg-foreground/5 hover:border-foreground/20"
            }`}
          >
            <p className="text-lg font-bold text-accent">{pkg.days} ngày</p>
            <p className="mt-1 text-sm text-muted">{pkg.coins} coins</p>
          </button>
        ))}
      </div>

      <input type="hidden" name="days" value={selected} />

      {state.error && <p className="mt-3 text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-5 w-full">
        {pending ? "Đang xử lý..." : "Nâng cấp VIP"}
      </Button>
    </form>
  );
}
