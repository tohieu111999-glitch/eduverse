export const DEFAULT_VIP_CONFIG = {
  monthlyCoins: 600,
  yearlyCoins: 4320,
  lifetimeCoins: 9999,
};

export type VipConfig = typeof DEFAULT_VIP_CONFIG;

export function buildVipPackages(config: VipConfig) {
  return [
    {
      key: "monthly" as const,
      label: "1 tháng",
      days: 30,
      coins: config.monthlyCoins,
      badge: null,
      perDay: (config.monthlyCoins / 30).toFixed(1),
    },
    {
      key: "yearly" as const,
      label: "1 năm",
      days: 365,
      coins: config.yearlyCoins,
      badge: "Tiết kiệm 40%",
      perDay: (config.yearlyCoins / 365).toFixed(1),
    },
    {
      key: "lifetime" as const,
      label: "Trọn đời",
      days: 0,  // sentinel: 0 = lifetime
      coins: config.lifetimeCoins,
      badge: "Mãi mãi",
      perDay: null,
    },
  ] as const;
}

export type VipPackage = ReturnType<typeof buildVipPackages>[number];

// `vipLevel` can go stale after expiry since there's no background job to
// reset it — always check `vipExpiresAt` alongside it, not vipLevel alone.
export function isVip(user: { vipLevel: string; vipExpiresAt: Date | null }) {
  return user.vipLevel !== "FREE" && Boolean(user.vipExpiresAt) && user.vipExpiresAt! > new Date();
}

export const LIFETIME_EXPIRY = new Date("2099-12-31T00:00:00.000Z");
