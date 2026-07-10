"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { PaymentDialog } from "@/src/components/payment/payment-dialog";
import { createCourseOrderAction, confirmCoursePaymentAction } from "./actions";
import { formatVnd } from "@/src/lib/payment";
import { useRouter } from "next/navigation";

type SellerBank = {
  bankName: string;
  bankBin: string;
  bankAccount: string;
  bankAccountName: string;
} | null;

export function BuyCourseButton({
  courseId,
  price,
  sellerBank,
}: {
  courseId: string;
  price: number;
  sellerBank: SellerBank;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleFreeEnroll() {
    await createCourseOrderAction(courseId);
    router.refresh();
  }

  if (price === 0) {
    return (
      <button
        onClick={handleFreeEnroll}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <GraduationCap className="h-4 w-4" />
        Đăng ký miễn phí
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <GraduationCap className="h-4 w-4" />
        Đăng ký · {formatVnd(price)}
      </button>

      <PaymentDialog
        open={open}
        onClose={() => setOpen(false)}
        sellerBank={sellerBank}
        amountVnd={price}
        createOrderAction={() => createCourseOrderAction(courseId)}
        confirmAction={confirmCoursePaymentAction}
      />
    </>
  );
}
