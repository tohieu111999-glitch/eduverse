import Link from "next/link";
import { auth } from "@/src/lib/auth";
import { buttonVariants } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";
import { ThemeToggle } from "@/src/components/theme-toggle";
import {
  BookOpenCheck,
  Coins,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

const PILLARS = [
  {
    icon: BookOpenCheck,
    title: "Học tập như Duolingo",
    description: "Flashcard, từ vựng, mini quiz với lặp lại ngắt quãng (spaced repetition) và AI hỗ trợ.",
  },
  {
    icon: MessageCircle,
    title: "Trao đổi như Discord",
    description: "Server, channel, voice room, chat thời gian thực cho từng nhóm học, lớp học.",
  },
  {
    icon: Users,
    title: "Đăng bài như Facebook",
    description: "News feed thông minh, like, comment, share, follow và hồ sơ cá nhân đầy đủ.",
  },
  {
    icon: Coins,
    title: "Kiếm tiền từ tri thức",
    description: "Đăng bán tài liệu, hệ thống thanh toán trung gian an toàn, hoa hồng minh bạch.",
  },
  {
    icon: Trophy,
    title: "Cấp độ như game RPG",
    description: "EXP, Level, Rank, huy hiệu và bảng xếp hạng cho mọi hoạt động học tập.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant cá nhân",
    description: "Giải bài tập, dịch thuật, tạo flashcard, tóm tắt tài liệu và gợi ý lộ trình học.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="font-display text-xl font-bold">
          <span className="text-gradient-cyber">EduVerse</span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <Link href="/dashboard" className={buttonVariants("primary", "ml-1")}>
              Vào Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants("ghost")}>
                Đăng nhập
              </Link>
              <Link href="/register" className={buttonVariants("primary")}>
                Đăng ký miễn phí
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative flex flex-col items-center overflow-hidden px-6 py-24 text-center sm:py-32">
          <div className="absolute -top-40 left-1/2 -z-10 h-96 w-160 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          <span className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Nền tảng học tập xã hội thế hệ mới
          </span>
          <h1 className="font-display max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            Học tập, kết nối và{" "}
            <span className="text-gradient-cyber">kiến tạo tương lai</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            EduVerse kết hợp Duolingo, Discord, Facebook, Udemy và AI Assistant thành một thế giới học tập ảo duy
            nhất — nơi bạn học, giao lưu, chia sẻ kiến thức và kiếm tiền từ tri thức của mình.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className={buttonVariants("primary", "px-7 py-3 text-base")}>
              Bắt đầu miễn phí
            </Link>
            <Link href="/login" className={buttonVariants("glass", "px-7 py-3 text-base")}>
              Tôi đã có tài khoản
            </Link>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10">
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, description }) => (
              <GlassCard key={title} className="animate-fade-in p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gradient-cyber">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{description}</p>
              </GlassCard>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} EduVerse. Học tập như một thế giới, không chỉ một website.
      </footer>
    </div>
  );
}
