import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { saveChatAttachment, extOf } from "@/src/lib/storage";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Không có tệp" }, { status: 400 });
  }

  const isImage = file.type.startsWith("image/");
  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `Tệp quá lớn (tối đa ${Math.round(maxBytes / 1024 / 1024)}MB)` }, { status: 400 });
  }

  const ext = extOf(file.name) || (isImage ? ".jpg" : "");
  const url = await saveChatAttachment(file, ext);

  return NextResponse.json({ url, name: file.name, type: isImage ? "IMAGE" : "FILE" });
}
