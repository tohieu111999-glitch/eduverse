"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Crown, X, Zap } from "lucide-react";
import Link from "next/link";

export function VipUpgradeDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild onClick={() => setOpen(true)}>
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="glass fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl">
          <Dialog.Close className="absolute right-4 top-4 text-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </Dialog.Close>

          {/* Header */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-amber-500 to-orange-600 shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <Dialog.Title className="text-xl font-bold">Nội dung VIP</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted">
              Nâng cấp lên VIP để mở khóa tất cả bộ từ vựng cao cấp và nhiều tính năng đặc biệt khác.
            </Dialog.Description>
          </div>

          {/* Benefits */}
          <ul className="mb-6 space-y-2">
            {[
              "Mở khóa tất cả bộ từ vựng HSK 4, 5, 6",
              "Thành ngữ & câu mẫu tiếng Trung",
              "Lộ trình học cá nhân hóa bởi AI",
              "Không giới hạn flashcard & quiz",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/vip"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            <Crown className="h-4 w-4" />
            Nâng cấp VIP ngay
          </Link>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
