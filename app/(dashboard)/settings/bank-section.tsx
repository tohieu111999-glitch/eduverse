"use client";

import { useActionState, useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import { saveBankAccountAction } from "./actions";
import { BANKS } from "@/src/lib/payment";

type Props = {
  bankName: string | null;
  bankBin: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
};

export function BankSection({ bankName, bankBin, bankAccount, bankAccountName }: Props) {
  const [state, action, pending] = useActionState(saveBankAccountAction, null);
  const [selectedBin, setSelectedBin] = useState(bankBin ?? "");

  function handleBankChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const bank = BANKS.find((b) => b.shortName === e.target.value);
    setSelectedBin(bank?.bin ?? "");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted" />
        <p className="text-sm text-muted">
          Thông tin để nhận thanh toán khi người dùng mua tài liệu hoặc khoá học của bạn.
        </p>
      </div>

      {state?.success && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Đã lưu thông tin ngân hàng
        </div>
      )}
      {state?.error && (
        <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{state.error}</p>
      )}

      <form action={action} className="space-y-3">
        <input type="hidden" name="bankBin" value={selectedBin} />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Ngân hàng</label>
          <select
            name="bankName"
            defaultValue={bankName ?? ""}
            onChange={handleBankChange}
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
            required
          >
            <option value="">-- Chọn ngân hàng --</option>
            {BANKS.map((b) => (
              <option key={b.bin} value={b.shortName}>
                {b.shortName} – {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Số tài khoản</label>
          <input
            name="bankAccount"
            type="text"
            inputMode="numeric"
            defaultValue={bankAccount ?? ""}
            placeholder="Nhập số tài khoản..."
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Tên chủ tài khoản</label>
          <input
            name="bankAccountName"
            type="text"
            defaultValue={bankAccountName ?? ""}
            placeholder="VD: NGUYEN VAN A"
            style={{ textTransform: "uppercase" }}
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Đang lưu..." : "Lưu thông tin ngân hàng"}
        </button>
      </form>
    </div>
  );
}
