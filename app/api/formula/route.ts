import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { isAiConfigured } from "@/src/lib/ai";
import Anthropic from "@anthropic-ai/sdk";

const FORMULA_SYSTEM = `Bạn là công cụ tra cứu công thức khoa học chuyên nghiệp.
Trả về JSON thuần, không markdown, không giải thích thêm.

Schema:
{
  "name": "Tên công thức/định luật",
  "formula": "Công thức (dùng ký hiệu toán học thuần văn bản, ví dụ: F = m * a)",
  "variables": [{"symbol": "F", "meaning": "Lực", "unit": "N (Newton)"}],
  "description": "Mô tả ngắn ý nghĩa và phạm vi áp dụng",
  "examples": ["Ví dụ 1 áp dụng công thức vào bài toán cụ thể", "Ví dụ 2"]
}

Nếu không tìm thấy: {"name":"","formula":"","variables":[],"description":"Không tìm thấy công thức này.","examples":[]}`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  if (!isAiConfigured()) return NextResponse.json({ error: "AI chưa được cấu hình" }, { status: 503 });

  const { query, subject } = await req.json() as { query?: string; subject?: string };
  if (!query?.trim()) return NextResponse.json({ error: "Vui lòng nhập từ khóa" }, { status: 400 });

  const client = new Anthropic();
  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: FORMULA_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Tra cứu công thức/định luật trong môn ${subject ?? "Khoa học"}: "${query}"`,
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
