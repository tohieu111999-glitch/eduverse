import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const FREE_DAILY_AI_LIMIT = 20;

const SYSTEM_PROMPT = `Bạn là trợ lý AI học tập của EduVerse, một nền tảng học tập xã hội. Bạn giúp người dùng:
- Giải bài tập và giải thích từng bước
- Dịch thuật giữa các ngôn ngữ
- Tóm tắt tài liệu học tập
- Tạo đề thi và câu hỏi luyện tập
- Gợi ý lộ trình học tập

Luôn trả lời bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác. Giải thích rõ ràng, súc tích, phù hợp với học sinh/sinh viên.
QUAN TRỌNG: Không dùng markdown. Không dùng **, __, ##, ---, *, gạch ngang hay bất kỳ ký hiệu định dạng nào. Chỉ viết văn bản thuần, dùng số thứ tự (1. 2. 3.) nếu cần liệt kê.`;

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient() {
  if (!isAiConfigured()) throw new Error("AI chưa được cấu hình");
  return new Anthropic();
}

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AssistantReply = { text: string; inputTokens: number; outputTokens: number };

export async function askAssistant(history: ChatMessage[]): Promise<AssistantReply> {
  const client = getClient();

  // Keep the request bounded — only the most recent turns are needed for
  // conversational continuity, and it caps token cost per request.
  const recent = history.slice(-20);

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: recent.map((m) => ({ role: m.role, content: m.content })),
  });

  const message = await stream.finalMessage();
  const usage = { inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens };

  if (message.stop_reason === "refusal") {
    return { text: "Mình không thể trả lời câu hỏi này. Bạn thử hỏi theo cách khác nhé.", ...usage };
  }

  const textBlock = message.content.find((b) => b.type === "text");
  return { text: textBlock?.type === "text" ? textBlock.text : "", ...usage };
}

const generatedQuestionSchema = z
  .object({
    type: z.enum(["MULTIPLE_CHOICE", "FILL_BLANK", "LISTENING", "SPEAKING"]),
    prompt: z.string().trim().min(1).max(500),
    answer: z.string().trim().min(1).max(200),
    options: z.array(z.string().trim().max(100)).max(4).optional().default([]),
  })
  .refine((q) => q.type !== "MULTIPLE_CHOICE" || q.options.includes(q.answer), {
    message: "answer must match one option for MULTIPLE_CHOICE",
  });

export type GeneratedQuizQuestion = z.infer<typeof generatedQuestionSchema>;

// Quiz questions auto-authored from user-supplied content (pasted vocabulary
// or an uploaded .txt/.pdf). PDFs are sent to Claude as a native document
// block — no separate PDF-parsing library needed.
export async function generateQuizQuestions(
  input: { kind: "text"; text: string } | { kind: "pdf"; base64: string },
  language: string,
): Promise<GeneratedQuizQuestion[]> {
  const client = getClient();

  const instructions = `Dựa trên nội dung được cung cấp, soạn tối đa 10 câu hỏi mini quiz kiểu Duolingo. Câu hỏi và đáp án ("prompt"/"answer"/"options") phải bằng ngôn ngữ có mã BCP-47 "${language}". Trộn đa dạng 4 loại:
- MULTIPLE_CHOICE: "options" là mảng 2-4 lựa chọn, "answer" khớp đúng một lựa chọn trong "options".
- FILL_BLANK: "prompt" là câu có chỗ trống đánh dấu bằng ___, "answer" là từ cần điền.
- LISTENING: "prompt" là câu/từ sẽ được đọc to cho người học nghe, "answer" giống chính xác "prompt".
- SPEAKING: "prompt" là cụm từ người học phải đọc to, "answer" giống chính xác "prompt".

Chỉ trả về JSON thuần là một mảng các object có các khoá "type", "prompt", "answer", "options". Không thêm giải thích, không markdown code block, không văn bản nào khác ngoài JSON.`;

  const content: Anthropic.Messages.ContentBlockParam[] =
    input.kind === "text"
      ? [{ type: "text", text: `${instructions}\n\nNội dung:\n${input.text.slice(0, 20000)}` }]
      : [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: input.base64 } },
          { type: "text", text: instructions },
        ];

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    messages: [{ role: "user", content }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (textBlock?.type !== "text") return [];

  let raw: unknown;
  try {
    const jsonText = textBlock.text
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim();
    raw = JSON.parse(jsonText);
  } catch {
    return [];
  }

  const parsed = z.array(generatedQuestionSchema).max(10).safeParse(raw);
  return parsed.success ? parsed.data : [];
}

const TRANSLATE_SYSTEM_PROMPT =
  'Bạn là công cụ dịch thuật. Nếu văn bản được cung cấp là tiếng Việt, dịch sang tiếng Anh; nếu là ngôn ngữ khác, dịch sang tiếng Việt. Chỉ trả lời đúng phần bản dịch, không thêm giải thích, không thêm dấu ngoặc kép, không lặp lại văn bản gốc, không thêm tiền tố như "Bản dịch:".';

// A dedicated minimal-prompt call (not askAssistant's chatty tutor persona)
// for the select-text-to-translate lookup feature, so the reply is just the
// translation with no surrounding chatter to strip out client-side.
export async function translateText(text: string): Promise<AssistantReply> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 300,
    system: TRANSLATE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: text.slice(0, 500) }],
  });

  const usage = { inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens };
  const textBlock = message.content.find((b) => b.type === "text");
  return { text: textBlock?.type === "text" ? textBlock.text.trim() : "", ...usage };
}
