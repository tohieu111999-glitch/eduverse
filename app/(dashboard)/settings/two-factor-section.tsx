"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import {
  startTwoFactorSetupAction,
  confirmTwoFactorAction,
  disableTwoFactorAction,
  type ConfirmTwoFactorState,
  type DisableTwoFactorState,
} from "./actions";
import { Button } from "@/src/components/ui/button";

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

const confirmInitial: ConfirmTwoFactorState = {};
const disableInitial: DisableTwoFactorState = {};

export function TwoFactorSection({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [confirmState, confirmAction, confirmPending] = useActionState(async (prev: ConfirmTwoFactorState, fd: FormData) => {
    const result = await confirmTwoFactorAction(prev, fd);
    if (result.success) {
      toast.success("Đã bật xác thực 2 lớp");
      setQrDataUrl(null);
      router.refresh();
    }
    return result;
  }, confirmInitial);

  const [disableState, disableAction, disablePending] = useActionState(async (prev: DisableTwoFactorState, fd: FormData) => {
    const result = await disableTwoFactorAction(prev, fd);
    if (result.success) {
      toast.success("Đã tắt xác thực 2 lớp");
      router.refresh();
    }
    return result;
  }, disableInitial);

  async function handleStart() {
    setStarting(true);
    const result = await startTwoFactorSetupAction();
    setStarting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setQrDataUrl(result.qrDataUrl ?? null);
  }

  return (
    <div className="rounded-xl bg-foreground/5 p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold">Xác thực 2 lớp (2FA)</h3>
      </div>
      <p className="mt-1 text-xs text-muted">
        Bảo vệ tài khoản bằng mã xác thực từ ứng dụng như Google Authenticator hoặc Authy.
      </p>

      {enabled ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-emerald-500">2FA đang được bật cho tài khoản này.</p>
          <form action={disableAction} className="flex gap-2">
            <input name="password" type="password" placeholder="Nhập mật khẩu để tắt 2FA" className={inputClass} required />
            <Button type="submit" variant="glass" disabled={disablePending} className="shrink-0 text-red-500">
              Tắt 2FA
            </Button>
          </form>
          {disableState.error && <p className="text-xs text-red-500">{disableState.error}</p>}
        </div>
      ) : qrDataUrl ? (
        <div className="mt-4 space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Mã QR thiết lập 2FA" className="mx-auto rounded-xl border border-foreground/10" />
          <p className="text-center text-xs text-muted">Quét mã QR bằng ứng dụng xác thực, sau đó nhập mã 6 số bên dưới.</p>
          <form action={confirmAction} className="flex gap-2">
            <input name="code" maxLength={6} placeholder="123456" className={inputClass} required />
            <Button type="submit" disabled={confirmPending} className="shrink-0">
              Xác nhận
            </Button>
          </form>
          {confirmState.error && <p className="text-xs text-red-500">{confirmState.error}</p>}
        </div>
      ) : (
        <Button onClick={handleStart} disabled={starting} variant="glass" className="mt-4">
          {starting ? "Đang tạo..." : "Bật 2FA"}
        </Button>
      )}
    </div>
  );
}
