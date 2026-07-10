"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { PaymentDialog } from "@/src/components/payment/payment-dialog";
import { createDocumentOrderAction, confirmDocumentPaymentAction } from "./actions";
import { formatVnd } from "@/src/lib/payment";

type SellerBank = {
  bankName: string;
  bankBin: string;
  bankAccount: string;
  bankAccountName: string;
} | null;

export function BuyButton({
  documentId,
  price,
  sellerBank,
}: {
  documentId: string;
  price: number;
  sellerBank: SellerBank;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <ShoppingCart className="h-4 w-4" />
        {price === 0 ? "Tải miễn phí" : `Mua · ${formatVnd(price)}`}
      </button>

      <PaymentDialog
        open={open}
        onClose={() => setOpen(false)}
        sellerBank={sellerBank}
        amountVnd={price}
        createOrderAction={() => createDocumentOrderAction(documentId)}
        confirmAction={confirmDocumentPaymentAction}
      />
    </>
  );
}
