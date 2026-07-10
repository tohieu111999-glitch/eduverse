import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/src/lib/auth";
import { isAiConfigured } from "@/src/lib/ai";
import { prisma } from "@/src/lib/prisma";

const LANG_NAMES: Record<string, string> = {
  vi: "Vietnamese",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  fr: "French",
  de: "German",
  es: "Spanish",
};

const FREE_DAILY_LIMIT = 20;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  if (!isAiConfigured()) return NextResponse.json({ error: "AI chưa được cấu hình" }, { status: 503 });

  const { text, srcLang, tgtLang } = (await req.json()) as {
    text?: string;
    srcLang?: string;
    tgtLang?: string;
  };

  if (!text?.trim()) return NextResponse.json({ error: "Thiếu văn bản" }, { status: 400 });
  if (text.length > 3000) return NextResponse.json({ error: "Văn bản tối đa 3000 ký tự" }, { status: 400 });

  // Rate limit for FREE users
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { vipLevel: true },
  });

  if (user?.vipLevel === "FREE") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const count = await prisma.translateHistory.count({
      where: { userId: session.user.id, createdAt: { gte: startOfDay } },
    });
    if (count >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Bạn đã dùng hết ${FREE_DAILY_LIMIT} lượt dịch hôm nay. Nâng cấp VIP để dịch không giới hạn.` },
        { status: 429 }
      );
    }
  }

  const srcName = LANG_NAMES[srcLang ?? "vi"] ?? srcLang ?? "Vietnamese";
  const tgtName = LANG_NAMES[tgtLang ?? "zh-CN"] ?? tgtLang ?? "Simplified Chinese";
  const needPinyin = tgtLang === "zh-CN" || tgtLang === "zh-TW";

  const system = `You are a professional translator. Translate text accurately, preserving paragraph breaks and formatting.
Return ONLY valid JSON with no markdown fence, no extra keys:
{
  "translation": "the translated text with original line breaks preserved",
  "pinyin": ${needPinyin ? '"romanized pinyin for the translated Chinese text (tone-marked, one space between syllables)"' : "null"}
}`;

  const client = new Anthropic();
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system,
      messages: [
        {
          role: "user",
          content: `Translate from ${srcName} to ${tgtName}:\n\n${text}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (textBlock?.type !== "text") throw new Error("No text block");

    const raw = textBlock.text.trim().replace(/^```(json)?/i, "").replace(/```$/m, "").trim();
    const parsed = JSON.parse(raw) as { translation: string; pinyin?: string | null };

    // Save to history (fire-and-forget)
    prisma.translateHistory
      .create({
        data: {
          userId: session.user.id,
          sourceText: text.slice(0, 3000),
          targetText: parsed.translation,
          pinyin: parsed.pinyin ?? null,
          sourceLang: srcLang ?? "vi",
          targetLang: tgtLang ?? "zh-CN",
        },
      })
      .catch(() => {});

    return NextResponse.json({ translation: parsed.translation, pinyin: parsed.pinyin ?? null });
  } catch {
    return NextResponse.json({ error: "Dịch thất bại, vui lòng thử lại." }, { status: 500 });
  }
}
