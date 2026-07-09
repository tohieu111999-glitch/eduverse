"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { purchaseCourseAction } from "./actions";
import { Button } from "@/src/components/ui/button";

export function BuyCourseButton({ courseId, price }: { courseId: string; price: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleBuy() {
    setPending(true);
    const result = await purchaseCourseAction(courseId);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Đăng ký khoá học thành công!");
    router.refresh();
  }

  return (
    <Button onClick={handleBuy} disabled={pending} className="w-full">
      {pending ? "Đang xử lý..." : price > 0 ? `Mua bằng ${price} coins` : "Đăng ký miễn phí"}
    </Button>
  );
}
