import { NextResponse } from "next/server";
import { stat, readFile } from "fs/promises";
import { createReadStream } from "fs";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { resolveCourseContentPath, extOf } from "@/src/lib/storage";
import { canAccessCourseContent } from "@/src/lib/course-access";
import { ALLOWED_VIDEO_TYPES } from "@/src/lib/courses";

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canAccessCourseContent(courseId, session.user.id))) {
    return NextResponse.json({ error: "Bạn chưa đăng ký khoá học này" }, { status: 403 });
  }

  const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const storageKey = lesson.type === "VIDEO" ? lesson.videoUrl : lesson.fileUrl;
  if (!storageKey) return NextResponse.json({ error: "Không có nội dung" }, { status: 404 });

  const filePath = resolveCourseContentPath(storageKey);
  const ext = extOf(storageKey);
  const contentType = lesson.type === "VIDEO" ? (ALLOWED_VIDEO_TYPES[ext] ?? "video/mp4") : "application/pdf";

  try {
    const { size } = await stat(filePath);
    const range = request.headers.get("range");

    // Video needs Range support for seeking — without it, browsers must
    // download the whole file before allowing scrubbing.
    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      const start = match?.[1] ? Number(match[1]) : 0;
      const end = match?.[2] ? Number(match[2]) : size - 1;
      const chunkSize = end - start + 1;

      const stream = createReadStream(filePath, { start, end });
      return new NextResponse(stream as unknown as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Cache-Control": "private, no-store",
        },
      });
    }

    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Tệp không tồn tại" }, { status: 404 });
  }
}
