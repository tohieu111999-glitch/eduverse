"use client";

import { useActionState, useState } from "react";
import { createTopupAction, type CreateTopupState } from "./actions";
import { Button } from "@/src/components/ui/button";
import { COIN_PACKAGES } from "@/src/lib/topup";

const initialState: CreateTopupState = {};

export function PackagePicker() {
  const [selected, setSelected] = useState<number>(COIN_PACKAGES[0].coins);
  const [state, formAction, pending] = useActionState(createTopupAction, initialState);

  return (
    <form action={formAction}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COIN_PACKAGES.map((pkg) => (
          <button
            key={pkg.coins}
            type="button"
            onClick={() => setSelected(pkg.coins)}
            className={`rounded-xl border p-4 text-center transition ${
              selected === pkg.coins
                ? "border-primary bg-primary/10"
                : "border-foreground/10 bg-foreground/5 hover:border-foreground/20"
            }`}
          >
            <p className="text-lg font-bold text-primary">{pkg.coins}</p>
            <p className="text-xs text-muted">coins</p>
            <p className="mt-2 text-sm font-medium">{pkg.price.toLocaleString("vi-VN")}đ</p>
          </button>
        ))}
      </div>

      <input type="hidden" name="coins" value={selected} />

      {state.error && <p className="mt-3 text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-5 w-full">
        {pending ? "Đang tạo yêu cầu..." : "Tạo yêu cầu nạp coin"}
      </Button>
    </form>
  );
}
