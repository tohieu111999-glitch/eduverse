// Platform takes this cut of every document sale; the remainder goes to the seller.
// TODO: move to an admin-adjustable setting once the admin dashboard exists.
export const COMMISSION_RATE = 0.1;

export const DOCUMENT_CATEGORIES = [
  "Toán học",
  "Ngữ văn",
  "Tiếng Anh",
  "Tiếng Trung",
  "Tiếng Hàn",
  "Tiếng Nhật",
  "Khoa học",
  "Tin học",
  "Lập trình",
  "Kinh tế",
  "Khác",
] as const;

export const ALLOWED_DOCUMENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
};

export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_COVER_SIZE_BYTES = 4 * 1024 * 1024;

export function splitCommission(price: number) {
  const commission = Math.round(price * COMMISSION_RATE);
  const sellerPayout = price - commission;
  return { commission, sellerPayout };
}
