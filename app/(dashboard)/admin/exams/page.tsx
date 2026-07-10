import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, PlusCircle, Trash2 } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { deleteExamAction, createExamAction, toggleExamActiveAction } from "./actions";

const EXAM_TYPES = ["HSK", "TOCFL", "JLPT", "TOPIK", "CUSTOM"] as const;

export default async function AdminExamsPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const exams = await prisma.exam.findMany({
    orderBy: [{ examType: "asc" }, { level: "asc" }],
    include: { _count: { select: { questions: true, attempts: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-muted hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Quản lý đề thi</h1>
        </div>
      </div>

      {/* Create form */}
      <GlassCard className="p-5">
        <p className="mb-4 text-sm font-semibold">Thêm đề thi mới</p>
        <form action={createExamAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Tên đề thi *</label>
              <input
                name="title"
                required
                placeholder="VD: HSK 2 – Đề thi 1"
                className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Loại đề *</label>
              <select
                name="examType"
                className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Cấp độ *</label>
              <input
                name="level"
                required
                placeholder="VD: 2 hoặc Nhóm A"
                className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Thời gian (phút) *</label>
              <input
                name="duration"
                type="number"
                min="5"
                max="180"
                defaultValue="40"
                required
                className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Mô tả</label>
            <textarea
              name="description"
              rows={2}
              className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-muted">Kỹ năng:</span>
            {["LISTENING", "READING"].map((s) => (
              <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox" name={`skill_${s}`} className="rounded" />
                {s === "LISTENING" ? "Nghe" : "Đọc"}
              </label>
            ))}
            <label className="ml-auto flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" name="isActive" defaultChecked className="rounded" />
              Kích hoạt ngay
            </label>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Tạo đề thi
          </button>
        </form>
      </GlassCard>

      {/* Exam list */}
      <div className="space-y-2">
        {exams.length === 0 && (
          <GlassCard className="py-10 text-center text-sm text-muted">
            Chưa có đề thi nào. Tạo đề thi đầu tiên ở trên.
          </GlassCard>
        )}
        {exams.map((exam) => (
          <GlassCard key={exam.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  exam.isActive ? "bg-green-500/15 text-green-400" : "bg-foreground/10 text-muted"
                }`}>
                  {exam.examType} {exam.level}
                </span>
                {!exam.isActive && (
                  <span className="text-xs text-muted">(ẩn)</span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium truncate">{exam.title}</p>
              <p className="text-xs text-muted">
                {exam._count.questions} câu · {exam.duration} phút · {exam._count.attempts} lượt thi
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={`/exam/${exam.id}/take`}
                className="rounded-lg border border-foreground/10 p-1.5 text-muted transition hover:text-foreground"
                title="Xem trước"
              >
                <Eye className="h-3.5 w-3.5" />
              </Link>
              <form action={toggleExamActiveAction.bind(null, exam.id, !exam.isActive)}>
                <button
                  type="submit"
                  title={exam.isActive ? "Ẩn đề thi" : "Hiện đề thi"}
                  className="rounded-lg border border-foreground/10 p-1.5 text-muted transition hover:text-foreground"
                >
                  {exam.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </form>
              <form action={deleteExamAction.bind(null, exam.id)}>
                <button
                  type="submit"
                  title="Xoá đề thi"
                  className="rounded-lg border border-red-500/20 p-1.5 text-red-400 transition hover:bg-red-500/10"
                  onClick={(e) => {
                    if (!confirm(`Xoá đề thi "${exam.title}"? Tất cả câu hỏi và kết quả sẽ bị xoá.`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
