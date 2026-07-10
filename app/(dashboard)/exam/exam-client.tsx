"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Clock, Headphones, Trophy } from "lucide-react";
import { GlassCard } from "@/src/components/ui/glass-card";

const TIPS = [
  "Luyện nghe hàng ngày kể cả khi không học chính thức sẽ cải thiện kỹ năng nhanh chóng.",
  "Học từ vựng mỗi ngày 15–20 từ giúp nhớ lâu hơn so với nhồi nhét một lúc.",
  "Viết tay chữ Hán giúp ghi nhớ nét chữ tốt hơn nhiều so với gõ bàn phím.",
  "Ôn tập lại sau 1 ngày, 3 ngày, 7 ngày và 30 ngày để nhớ lâu nhất.",
  "Học theo chủ đề (gia đình, thức ăn, du lịch...) giúp từ vựng liên kết với nhau tốt hơn.",
  "Nghe podcast hoặc xem phim có phụ đề tiếng Trung giúp luyện nghe tự nhiên hơn.",
  "Đọc to khi luyện phát âm — tai sẽ nhận ra lỗi nhanh hơn mắt.",
  "Ghi chép từ mới vào sổ tay và xem lại trước khi ngủ là cách củng cố trí nhớ hiệu quả.",
];

type ExamCard = {
  id: string;
  title: string;
  description: string | null;
  examType: string;
  level: string;
  duration: number;
  skills: string[];
  questionCount: number;
  attemptCount: number;
};

const HSK_LEVELS = ["1", "2", "3", "4", "5", "6"];
const TOCFL_LEVELS = [
  { value: "入門", label: "Nhập môn" },
  { value: "初等", label: "Nhóm A" },
  { value: "中等", label: "Nhóm B" },
  { value: "高等", label: "Nhóm C" },
];

function SkillChip({ skill }: { skill: string }) {
  if (skill === "LISTENING")
    return (
      <span className="flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-400">
        <Headphones className="h-3 w-3" />
        Nghe
      </span>
    );
  if (skill === "READING")
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-medium text-green-400">
        <BookOpen className="h-3 w-3" />
        Đọc
      </span>
    );
  return <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] text-muted">{skill}</span>;
}

function ExamCardItem({ exam }: { exam: ExamCard }) {
  return (
    <div className="w-56 shrink-0">
      <GlassCard className="flex h-full flex-col p-4">
        <p className="font-semibold text-sm leading-snug">{exam.title}</p>
        {exam.description && (
          <p className="mt-1 text-xs text-muted line-clamp-2">{exam.description}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="font-medium text-foreground/80">{exam.questionCount}</span> câu
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {exam.duration} phút
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {exam.skills.map((s) => (
            <SkillChip key={s} skill={s} />
          ))}
        </div>
        <Link
          href={`/exam/${exam.id}/take`}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          Bắt đầu
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </GlassCard>
    </div>
  );
}

function EmptyLevel() {
  return (
    <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-dashed border-foreground/15 text-sm text-muted">
      Chưa có đề thi nào ở cấp độ này
    </div>
  );
}

export function ExamClient({
  hskExams,
  tocflExams,
  tipIndex,
}: {
  hskExams: ExamCard[];
  tocflExams: ExamCard[];
  tipIndex: number;
}) {
  const [hskLevel, setHskLevel] = useState("1");
  const [tocflLevel, setTocflLevel] = useState("入門");

  const filteredHsk = hskExams.filter((e) => e.level === hskLevel);
  const filteredTocfl = tocflExams.filter((e) => e.level === tocflLevel);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-400" />
          <h1 className="text-xl font-semibold">Thi thử</h1>
        </div>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1.5 rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-medium transition hover:border-amber-400 hover:text-amber-400"
        >
          <Trophy className="h-3.5 w-3.5" />
          Vinh danh
        </Link>
      </div>

      {/* Tips banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm">
        <span className="text-base">💡</span>
        <p className="text-foreground/80">{TIPS[tipIndex % TIPS.length]}</p>
      </div>

      {/* HSK Section */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">HSK – 汉语水平考试</h2>
          <p className="text-xs text-muted mt-0.5">Bài kiểm tra trình độ tiếng Trung quốc tế</p>
        </div>

        {/* Level tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {HSK_LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setHskLevel(lv)}
              className={`shrink-0 rounded-xl border px-4 py-1.5 text-sm font-medium transition
                ${hskLevel === lv
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-foreground/10 bg-foreground/5 text-muted hover:text-foreground"
                }`}
            >
              HSK {lv}
            </button>
          ))}
        </div>

        {/* Exam cards horizontal scroll */}
        {filteredHsk.length === 0 ? (
          <EmptyLevel />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredHsk.map((exam) => (
              <ExamCardItem key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>

      {/* TOCFL Section */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">TOCFL – 華語文能力測驗</h2>
          <p className="text-xs text-muted mt-0.5">Bài kiểm tra trình độ tiếng Hoa của Đài Loan</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TOCFL_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTocflLevel(value)}
              className={`shrink-0 rounded-xl border px-4 py-1.5 text-sm font-medium transition
                ${tocflLevel === value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-foreground/10 bg-foreground/5 text-muted hover:text-foreground"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredTocfl.length === 0 ? (
          <EmptyLevel />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredTocfl.map((exam) => (
              <ExamCardItem key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
