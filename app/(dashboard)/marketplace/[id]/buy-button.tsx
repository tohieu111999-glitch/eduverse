"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { purchaseDocumentAction } from "./actions";
import { Button } from "@/src/components/ui/button";

export function BuyButton({ documentId, price }: { documentId: string; price: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleBuy() {
    setPending(true);
    const result = await purchaseDocumentAction(documentId);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Mua tài liệu thành công!");
    router.refresh();
  }

  return (
    <Button onClick={handleBuy} disabled={pending} className="w-full">
      {pending ? "Đang xử lý..." : `Mua bằng ${price} coins`}
    </Button>
  );
}
