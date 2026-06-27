export const VIP_PACKAGES = [
  { days: 7, coins: 200 },
  { days: 30, coins: 600 },
  { days: 90, coins: 1500 },
] as const;

// `vipLevel` can go stale after expiry since there's no background job to
// reset it — always check `vipExpiresAt` alongside it, not vipLevel alone.
export function isVip(user: { vipLevel: string; vipExpiresAt: Date | null }) {
  return user.vipLevel !== "FREE" && Boolean(user.vipExpiresAt) && user.vipExpiresAt! > new Date();
}
