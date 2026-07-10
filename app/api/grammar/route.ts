import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { isAiConfigured } from "@/src/lib/ai";
import Anthropic from "@anthropic-ai/sdk";

const GRAMMAR_SYSTEM = `Bạn là chuyên gia ngữ pháp ngôn ngữ học.
Trả về JSON thuần, không markdown, không giải thích thêm.

Schema:
{
  "structure": "Cấu trúc ngữ pháp (ví dụ: S + have/has + V3/ed + O)",
  "meaning": "Ý nghĩa chính của cấu trúc này bằng tiếng Việt",
  "usage": "Khi nào và cách dùng cấu trúc này",
  "examples": [
    {"sentence": "Câu ví dụ bằng ngôn ngữ gốc", "translation": "Dịch nghĩa tiếng Việt", "note": "Ghi chú thêm nếu cần (hoặc null)"}
  ],
  "notes": "Lưu ý đặc biệt, ngoại lệ (hoặc null nếu không có)"
}`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  if (!isAiConfigured()) return NextResponse.json({ error: "AI chưa được cấu hình" }, { status: 503 });

  const { query, language } = await req.json() as { query?: string; language?: string };
  if (!query?.trim()) return NextResponse.json({ error: "Vui lòng nhập từ khóa" }, { status: 400 });

  const client = new Anthropic();
  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: GRAMMAR_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Tra cứu ngữ pháp ${language ?? "tiếng Anh"}: "${query}"`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (textBlock?.type !== "text") throw new Error("No text");

    const raw = textBlock.text.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    const result = JSON.parse(raw);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "Không thể tra cứu. Vui lòng thử lại." }, { status: 500 });
  }
}
