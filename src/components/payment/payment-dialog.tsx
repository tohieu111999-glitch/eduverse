"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, QrCode, X } from "lucide-react";
import { vietQrUrl, formatVnd } from "@/src/lib/payment";

type SellerBank = {
  bankName: string;
  bankBin: string;
  bankAccount: string;
  bankAccountName: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  sellerBank: SellerBank | null;
  amountVnd: number;
  /** Server action: creates an order, returns {orderId, paymentRef} or {error} */
  createOrderAction: () => Promise<{ orderId: string; paymentRef: string } | { error: string }>;
  /** Server action: marks order as paid (+ grants access for courses) */
  confirmAction: (orderId: string) => Promise<{ success: boolean } | { error: string }>;
};

export function PaymentDialog({
  open,
  onClose,
  sellerBank,
  amountVnd,
  createOrderAction,
  confirmAction,
}: Props) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setOrderId(null);
    setPaymentRef(null);
    setInitError(null);
    setConfirmError(null);

    if (!sellerBank || amountVnd === 0) return;

    createOrderAction().then((res) => {
      if ("error" in res) {
        setInitError(res.error);
      } else {
        setOrderId(res.orderId);
        setPaymentRef(res.paymentRef);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function copyRef() {
    if (!paymentRef) return;
    navigator.clipboard.writeText(paymentRef).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleConfirm() {
    if (!orderId) return;
    startTransition(async () => {
      const res = await confirmAction(orderId);
      if ("error" in res) {
        setConfirmError(res.error);
      } else {
        onClose();
        router.refresh();
      }
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span className="font-semibold">Thanh toán chuyển khoản</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* No bank info */}
          {!sellerBank && (
            <div className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
              Người bán chưa cập nhật thông tin ngân hàng. Vui lòng liên hệ trực tiếp để thanh toán.
            </div>
          )}

          {/* Free item */}
          {sellerBank && amountVnd === 0 && (
            <div className="rounded-xl bg-primary/10 p-4 text-sm text-primary text-center font-medium">
              Tài liệu/khóa học này miễn phí!
            </div>
          )}

          {sellerBank && amountVnd > 0 && (
            <>
              {initError && (
                <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{initError}</div>
              )}

              {/* Amount */}
              <div className="rounded-xl bg-primary/10 p-4 text-center">
                <p className="text-xs text-muted">Số tiền chuyển khoản</p>
                <p className="mt-1 text-2xl font-bold text-primary">{formatVnd(amountVnd)}</p>
              </div>

              {/* QR Code */}
              {paymentRef && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vietQrUrl(sellerBank.bankBin, sellerBank.bankAccount, amountVnd, paymentRef, sellerBank.bankAccountName)}
                    alt="QR chuyển khoản"
                    className="h-48 w-48 rounded-xl border border-foreground/10"
                  />
                </div>
              )}

              {/* Bank info */}
              <div className="space-y-2 rounded-xl border border-foreground/10 bg-foreground/3 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Ngân hàng</span>
                  <span className="font-medium">{sellerBank.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Số tài khoản</span>
                  <span className="font-mono font-medium">{sellerBank.bankAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Chủ tài khoản</span>
                  <span className="font-medium">{sellerBank.bankAccountName}</span>
                </div>
              </div>

              {/* Payment ref */}
              {paymentRef && (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-muted uppercase tracking-wide">Nội dung chuyển khoản</p>
                    <p className="mt-0.5 font-mono font-bold text-primary">{paymentRef}</p>
                  </div>
                  <button
                    onClick={copyRef}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              )}

              {confirmError && (
                <p className="text-sm text-red-500">{confirmError}</p>
              )}

              <button
                onClick={handleConfirm}
                disabled={isPending || !orderId}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Đang xác nhận..." : "Tôi đã chuyển tiền"}
              </button>
              <p className="text-center text-[10px] text-muted">
                Sau khi chuyển tiền, nhấn xác nhận để mở khoá nội dung.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
