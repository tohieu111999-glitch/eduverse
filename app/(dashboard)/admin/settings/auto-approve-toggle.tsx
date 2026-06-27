"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { setAutoApproveTopupsAction } from "./actions";

export function AutoApproveToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    const result = await setAutoApproveTopupsAction(!enabled);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(enabled ? "Đã tắt tự động duyệt" : "Đã bật tự động duyệt");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Tự động duyệt nạp coin</p>
          <p className="text-sm text-muted">
            Khi tắt (mặc định): bạn xác nhận thủ công từng yêu cầu nạp coin sau khi kiểm tra tài khoản ngân hàng đã
            nhận tiền. Khi bật: hệ thống cộng coin ngay khi khách bấm &quot;Tạo yêu cầu nạp coin&quot;, không chờ admin duyệt.
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={pending}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-emerald-500" : "bg-foreground/15"}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-3 flex gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-500">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            Đang bật: không có xác minh chuyển khoản thật, nên bất kỳ ai tạo yêu cầu nạp coin sẽ được cộng coin ngay
            mà không cần thật sự chuyển tiền. Chỉ dùng khi bạn đã có cách kiểm tra/đối soát khác, hoặc chấp nhận rủi
            ro gian lận.
          </p>
        </div>
      )}
    </div>
  );
}
