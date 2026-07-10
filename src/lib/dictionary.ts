import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { isAiConfigured } from "./ai";

export const DICT_DIRECTIONS = {
  CN_TO_VI: { label: "Trung → Việt", src: "CN", tgt: "VI", srcLang: "tiếng Trung", tgtLang: "tiếng Việt", ttsLang: "zh-CN" },
  VI_TO_CN: { label: "Việt → Trung", src: "VI", tgt: "CN", srcLang: "tiếng Việt", tgtLang: "tiếng Trung", ttsLang: "vi-VN" },
  EN_TO_VI: { label: "Anh → Việt", src: "EN", tgt: "VI", srcLang: "tiếng Anh", tgtLang: "tiếng Việt", ttsLang: "en-US" },
  VI_TO_EN: { label: "Việt → Anh", src: "VI", tgt: "EN", srcLang: "tiếng Việt", tgtLang: "tiếng Anh", ttsLang: "vi-VN" },
  JP_TO_VI: { label: "Nhật → Việt", src: "JP", tgt: "VI", srcLang: "tiếng Nhật", tgtLang: "tiếng Việt", ttsLang: "ja-JP" },
  VI_TO_JP: { label: "Việt → Nhật", src: "VI", tgt: "JP", srcLang: "tiếng Việt", tgtLang: "tiếng Nhật", ttsLang: "vi-VN" },
  KR_TO_VI: { label: "Hàn → Việt", src: "KR", tgt: "VI", srcLang: "tiếng Hàn", tgtLang: "tiếng Việt", ttsLang: "ko-KR" },
  VI_TO_KR: { label: "Việt → Hàn", src: "VI", tgt: "KR", srcLang: "tiếng Việt", tgtLang: "tiếng Hàn", ttsLang: "vi-VN" },
  FR_TO_VI: { label: "Pháp → Việt", src: "FR", tgt: "VI", srcLang: "tiếng Pháp", tgtLang: "tiếng Việt", ttsLang: "fr-FR" },
  VI_TO_FR: { label: "Việt → Pháp", src: "VI", tgt: "FR", srcLang: "tiếng Việt", tgtLang: "tiếng Pháp", ttsLang: "vi-VN" },
  CN_TRADITIONAL: { label: "Phồn thể → Việt", src: "CNT", tgt: "VI", srcLang: "tiếng Trung phồn thể", tgtLang: "tiếng Việt", ttsLang: "zh-TW" },
} as const;

export type DictDirection = keyof typeof DICT_DIRECTIONS;

const exampleSchema = z.object({
  zh: z.string(),
  pinyin: z.string(),
  vi: z.string(),
});

const dictResultSchema = z.object({
  simplified: z.string(),
  traditional: z.string(),
  pinyin: z.string(),
  hanViet: z.string(),
  partOfSpeech: z.array(z.string()),
  meanings: z.array(z.string()).min(1),
  examples: z.array(exampleSchema).max(3),
  notFound: z.boolean().optional(),
});

export type DictResult = z.infer<typeof dictResultSchema>;

function buildSystemPrompt(dir: DictDirection): string {
  const info = DICT_DIRECTIONS[dir];
  const isChinese = dir === "CN_TO_VI" || dir === "VI_TO_CN" || dir === "CN_TRADITIONAL";

  return `Bạn là từ điển ${info.srcLang}-${info.tgtLang} chuyên nghiệp.
Trả về KẾT QUẢ dưới dạng JSON thuần túy, không markdown, không giải thích thêm.

Schema bắt buộc:
{
  "simplified": "${isChinese ? "chữ giản thể (hoặc từ nguồn)" : "từ nguồn (ngôn ngữ gốc)"}",
  "traditional": "${isChinese ? "chữ phồn thể (nếu giống giản thể thì chép lại)" : "dạng thay thế hoặc chép lại"}",
  "pinyin": "${isChinese ? "pīn yīn có dấu thanh điệu" : "phiên âm/IPA/romaji (nếu không có thì để trống)"}",
  "hanViet": "${isChinese ? "âm Hán Việt" : "ghi chú thêm (từ gốc, từ đồng nghĩa,... hoặc để trống)"}",
  "partOfSpeech": ["danh từ"],
  "meanings": ["nghĩa bằng ${info.tgtLang}"],
  "examples": [
    {"zh": "câu ví dụ bằng ${info.srcLang}", "pinyin": "phiên âm (nếu có)", "vi": "dịch sang ${info.tgtLang}"}
  ]
}

Nếu không tìm thấy từ phù hợp: {"simplified":"","traditional":"","pinyin":"","hanViet":"","partOfSpeech":[],"meanings":[],"examples":[],"notFound":true}`;
}

export async function lookupWord(query: string, direction: DictDirection): Promise<DictResult> {
  if (!isAiConfigured()) {
    return {
      simplified: "",
      traditional: "",
      pinyin: "",
      hanViet: "",
      partOfSpeech: [],
      meanings: ["AI chưa được cấu hình. Vui lòng thêm ANTHROPIC_API_KEY vào .env"],
      examples: [],
      notFound: true,
    };
  }

  const info = DICT_DIRECTIONS[direction] ?? DICT_DIRECTIONS.CN_TO_VI;
  const client = new Anthropic();

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: buildSystemPrompt(direction),
      messages: [{ role: "user", content: `Tra từ (${info.label}): "${query}"` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (textBlock?.type !== "text") throw new Error("No text response");

    const raw = textBlock.text
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim();

    const parsed = dictResultSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("Invalid schema");
    return parsed.data;
  } catch {
    return {
      simplified: query,
      traditional: query,
      pinyin: "",
      hanViet: "",
      partOfSpeech: [],
      meanings: ["Không tìm thấy kết quả. Vui lòng thử lại."],
      examples: [],
      notFound: true,
    };
  }
}
