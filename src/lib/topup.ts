import { randomInt } from "crypto";

export const COIN_PACKAGES = [
  { coins: 100, price: 20000 },
  { coins: 500, price: 95000 },
  { coins: 1000, price: 180000 },
  { coins: 5000, price: 850000 },
] as const;

// Flat rate used for converting coins back to VND outside the tiered
// top-up packages above (AI billing cost estimates, seller withdrawals) —
// matches the smallest package's rate, the most conservative tier.
export const VND_PER_COIN = 200;

export function generateReference() {
  return `EDU${randomInt(100000, 999999)}`;
}

export function getBankInfo() {
  const bin = process.env.BANK_BIN;
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
  const accountName = process.env.BANK_ACCOUNT_NAME;
  if (!bin || !accountNumber || !accountName) return null;
  return { bin, accountNumber, accountName };
}

export function buildVietQrUrl({
  amount,
  reference,
}: {
  amount: number;
  reference: string;
}) {
  const bank = getBankInfo();
  if (!bank) return null;

  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: reference,
    accountName: bank.accountName,
  });

  return `https://img.vietqr.io/image/${bank.bin}-${bank.accountNumber}-compact2.png?${params.toString()}`;
}
