import { Crown } from "lucide-react";

export function VipCrown({
  vipLevel,
  vipExpiresAt,
  size = "sm",
}: {
  vipLevel: string;
  vipExpiresAt: Date | null;
  size?: "sm" | "md";
}) {
  const active = vipLevel !== "FREE" && vipExpiresAt != null && vipExpiresAt > new Date();
  if (!active) return null;
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span title={vipLevel === "VIP_PLUS" ? "VIP+" : "VIP"} className="inline-flex shrink-0 items-center">
      <Crown className={`${cls} text-amber-400`} />
    </span>
  );
}
