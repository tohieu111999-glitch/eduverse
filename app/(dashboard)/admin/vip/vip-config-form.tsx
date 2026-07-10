"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveVipConfigAction, type VipConfigState } from "./actions";
import { Button } from "@/src/components/ui/button";

type DefaultValues = { monthlyCoins: number; yearlyCoins: number; lifetimeCoins: number };

const initial: VipConfigState = {};

export function VipConfigForm({ defaultValues }: { defaultValues: DefaultValues }) {
  const [state, formAction, pending] = useActionState(saveVipConfigAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      {[
        { name: "monthlyCoins", label: "Gói 1 tháng (coins)", default: defaultValues.monthlyCoins },
        { name: "yearlyCoins", label: "Gói 1 năm (coins) — Tiết kiệm 40%", default: defaultValues.yearlyCoins },
        { name: "lifetimeCoins", label: "Gói Trọn đời (coins)", default: defaultValues.lifetimeCoins },
      ].map((field) => (
        <div key={field.name} className="space-y-1.5">
          <label className="text-sm font-medium">{field.label}</label>
          <input
            type="number"
            name={field.name}
            defaultValue={field.default}
            min={1}
            required
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      ))}

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
          <Check className="h-4 w-4" /> Đã lưu cấu hình VIP
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</> : "Lưu cấu hình"}
      </Button>
    </form>
  );
}
