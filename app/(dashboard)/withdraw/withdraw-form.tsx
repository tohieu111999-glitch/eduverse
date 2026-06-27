"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { requestWithdrawalAction, type RequestWithdrawalState } from "./actions";
import { Button } from "@/src/components/ui/button";

const initialState: RequestWithdrawalState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function WithdrawForm({
  coins,
  lastBank,
}: {
  coins: number;
  lastBank: { bankName: string; bankAccountNumber: string; bankAccountName: string } | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: RequestWithdrawalState, fd: FormData) => {
    const result = await requestWithdrawalAction(prev, fd);
    if (!result.error) {
      toast.success("Đã gửi yêu cầu rút coin, chờ admin xác nhận chuyển khoản");
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Số coin muốn rút (tối đa {coins})</label>
        <input name="coins" type="number" min={100} max={coins} className={inputClass} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tên ngân hàng</label>
        <input name="bankName" defaultValue={lastBank?.bankName} placeholder="VD: Vietcombank" className={inputClass} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Số tài khoản</label>
        <input
          name="bankAccountNumber"
          defaultValue={lastBank?.bankAccountNumber}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tên chủ tài khoản</label>
        <input
          name="bankAccountName"
          defaultValue={lastBank?.bankAccountName}
          placeholder="VD: NGUYEN VAN A"
          className={inputClass}
          required
        />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending || coins < 100} className="w-full">
        {pending ? "Đang gửi..." : "Gửi yêu cầu rút coin"}
      </Button>
      {coins < 100 && <p className="text-center text-xs text-muted">Cần ít nhất 100 coin để rút.</p>}
    </form>
  );
}
