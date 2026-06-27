import { VND_PER_COIN } from "@/src/lib/topup";

// Token-metered billing for AI assistant usage beyond the free daily quota.
//
// IMPORTANT: these per-token USD prices are placeholders based on historical
// Opus-tier pricing and may not match Anthropic's current published rate for
// the model in src/lib/ai.ts — check https://www.anthropic.com/pricing and
// override via env before relying on this for real charges.
const INPUT_PRICE_PER_MTOK_USD = Number(process.env.AI_INPUT_PRICE_PER_MTOK_USD ?? 15);
const OUTPUT_PRICE_PER_MTOK_USD = Number(process.env.AI_OUTPUT_PRICE_PER_MTOK_USD ?? 75);
const USD_TO_VND = Number(process.env.USD_TO_VND_RATE ?? 25000);

// Resale markup over Anthropic's raw cost — covers server/ops overhead and
// margin. 1.5x-2x is the usual range for reselling LLM API access.
export const AI_BILLING_MARKUP = Number(process.env.AI_BILLING_MARKUP ?? 1.7);

export function estimateMessageCostCoins(inputTokens: number, outputTokens: number): number {
  const usdCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_MTOK_USD + (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_MTOK_USD;
  const vndCost = usdCost * USD_TO_VND * AI_BILLING_MARKUP;
  return Math.max(1, Math.ceil(vndCost / VND_PER_COIN));
}
