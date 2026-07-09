import { DOCUMENT_CATEGORIES } from "@/src/lib/marketplace";

// Same category list as the document marketplace — courses span the same
// subjects, no need for a separate taxonomy.
export const COURSE_CATEGORIES = DOCUMENT_CATEGORIES;

export const COURSE_LEVELS = ["Cơ bản", "Trung cấp", "Nâng cao"] as const;

export const LESSON_TYPE_LABELS: Record<string, string> = {
  VIDEO: "Video",
  PDF: "Tài liệu PDF",
  ARTICLE: "Bài viết",
  ASSIGNMENT: "Bài tập",
  QUIZ: "Bài kiểm tra",
};

export const MAX_COURSE_VIDEO_BYTES = 300 * 1024 * 1024;
export const MAX_COURSE_FILE_BYTES = 20 * 1024 * 1024;

export const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};
