// BCP-47 tags used for both TTS playback (listening questions) and speech
// recognition (speaking questions) via the browser's native Web Speech API.
export const QUIZ_LANGUAGES = [
  { code: "vi-VN", label: "Tiếng Việt" },
  { code: "en-US", label: "Tiếng Anh" },
  { code: "zh-CN", label: "Tiếng Trung" },
  { code: "ko-KR", label: "Tiếng Hàn" },
  { code: "ja-JP", label: "Tiếng Nhật" },
  { code: "fr-FR", label: "Tiếng Pháp" },
  { code: "de-DE", label: "Tiếng Đức" },
  { code: "es-ES", label: "Tiếng Tây Ban Nha" },
] as const;

export const QUIZ_LANGUAGE_CODES = QUIZ_LANGUAGES.map((l) => l.code) as [string, ...string[]];

export function quizLanguageLabel(code: string): string {
  return QUIZ_LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

export const QUIZ_VISIBILITIES = [
  { value: "PUBLIC", label: "Công khai", description: "Mọi người dùng đều thấy và làm được" },
  { value: "FRIENDS", label: "Bạn bè", description: "Chỉ những người theo dõi lẫn nhau với bạn" },
  { value: "PRIVATE", label: "Riêng tư", description: "Chỉ riêng bạn" },
] as const;
