"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  BookOpenCheck,
  Coins,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
  Zap,
  Star,
  Globe,
  ArrowRight,
  Play,
} from "lucide-react";

// ── StarField (CSS-only, zero JS animation → no flicker) ─────
function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1: sparse large stars */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "97px 97px",
        }}
      />
      {/* Layer 2: dense small stars, offset */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "53px 53px",
          backgroundPosition: "27px 43px",
        }}
      />
      {/* Layer 3: tiny scattered dots */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(200,210,255,0.7) 1px, transparent 1px)",
          backgroundSize: "31px 71px",
          backgroundPosition: "15px 22px",
        }}
      />
    </div>
  );
}

// ── Dashboard Mockup (3D tilted) ─────────────────────────────
function DashboardMockup() {
  return (
    <div style={{ perspective: "1400px" }} className="w-full">
      <motion.div
        initial={{ opacity: 0, rotateX: 20, rotateY: -25, scale: 0.85 }}
        animate={{ opacity: 1, rotateX: 8, rotateY: -12, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary/20"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none z-10 rounded-2xl" />

        <div className="flex h-[400px] bg-[#05050a]">
          {/* Sidebar */}
          <div className="flex w-14 shrink-0 flex-col items-center gap-3 border-r border-white/5 bg-[#0d0d14] py-4">
            <div className="mb-2 h-7 w-7 rounded-lg bg-primary/80" />
            {["bg-primary/60", "bg-accent/60", "bg-cyan-500/60", "bg-white/20", "bg-white/15", "bg-white/10"].map((c, i) => (
              <div key={i} className={`h-5 w-5 rounded-md ${c}`} />
            ))}
          </div>

          {/* Main */}
          <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="h-4 w-36 rounded-full bg-white/10" />
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/40" />
                <div className="h-6 w-6 rounded-full bg-white/10" />
              </div>
            </div>

            {/* Welcome card */}
            <div className="rounded-xl bg-linear-to-br from-blue-950 via-blue-900 to-indigo-900 p-4">
              <div className="mb-2 h-3 w-28 rounded-full bg-blue-200/30" />
              <div className="h-5 w-48 rounded-full bg-white/60" />
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-24 rounded-lg bg-white/20" />
                <div className="h-8 w-20 rounded-lg bg-white/10" />
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { c: "from-primary/20 to-primary/5", l: "bg-primary/50", w: "w-10" },
                { c: "from-accent/20 to-accent/5", l: "bg-accent/50", w: "w-14" },
                { c: "from-cyan-500/20 to-cyan-500/5", l: "bg-cyan-500/40", w: "w-8" },
              ].map(({ c, l, w }, i) => (
                <div key={i} className={`rounded-xl bg-linear-to-br ${c} border border-white/5 p-3`}>
                  <div className={`h-3 ${w} rounded-full ${l} mb-1.5`} />
                  <div className="h-5 w-8 rounded-full bg-white/40" />
                </div>
              ))}
            </div>

            {/* Flashcard preview */}
            <div className="rounded-xl border border-white/10 bg-white/5 py-4 text-center">
              <p className="text-2xl font-bold text-white">你好</p>
              <p className="mt-1 text-xs text-white/50">nǐ hǎo · Nễ Hảo</p>
              <div className="mt-3 flex justify-center gap-2">
                {["Quên", "Khó", "OK", "Dễ"].map((l, i) => (
                  <div key={i} className={`h-6 rounded-lg px-2 text-[9px] leading-6 font-medium text-white/70
                    ${["bg-red-500/30", "bg-orange-500/30", "bg-blue-500/30", "bg-green-500/30"][i]}`}>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Feed items */}
            <div className="space-y-2">
              {[{ w: "w-40", w2: "w-24" }, { w: "w-32", w2: "w-16" }].map(({ w, w2 }, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
                  <div className="h-6 w-6 rounded-full bg-primary/40 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className={`h-2.5 ${w} rounded-full bg-white/20`} />
                    <div className={`h-2 ${w2} rounded-full bg-white/10`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reflection glow */}
      <div className="mx-auto mt-4 h-8 w-3/4 rounded-full bg-primary/20 blur-2xl" />
    </div>
  );
}

// ── Scroll counter hook ──────────────────────────────────────
function useCounter(target: number, inView: boolean, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return val;
}

// ── Feature cards data ───────────────────────────────────────
const FEATURES = [
  {
    icon: BookOpenCheck,
    title: "Học như Duolingo",
    description: "Flashcard thông minh với thuật toán SM-2, từ điển Trung–Việt AI, mini quiz và lộ trình học cá nhân hóa.",
    color: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    glow: "hover:shadow-primary/20",
  },
  {
    icon: MessageCircle,
    title: "Trao đổi như Discord",
    description: "Server, channel, nhắn tin thời gian thực, chat nhóm lớp học — tất cả trong một nền tảng.",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    icon: Users,
    title: "Đăng bài như Facebook",
    description: "News feed cộng đồng học tập, like, comment, follow bạn bè và chia sẻ kiến thức.",
    color: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    glow: "hover:shadow-blue-500/20",
  },
  {
    icon: Coins,
    title: "Chợ tài liệu như Udemy",
    description: "Đăng bán tài liệu, khóa học, thanh toán qua hệ thống coin an toàn, hoa hồng minh bạch.",
    color: "from-amber-500/20 to-amber-500/5",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    glow: "hover:shadow-amber-500/20",
  },
  {
    icon: Trophy,
    title: "Cấp độ như game RPG",
    description: "EXP, Level, huy hiệu thành tích, bảng xếp hạng — học tập trở thành cuộc phiêu lưu.",
    color: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
    glow: "hover:shadow-accent/20",
  },
  {
    icon: Sparkles,
    title: "AI như gia sư riêng",
    description: "Claude AI giải bài tập, dịch thuật, tạo flashcard, tóm tắt tài liệu và tư vấn lộ trình học.",
    color: "from-pink-500/20 to-pink-500/5",
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
    glow: "hover:shadow-pink-500/20",
  },
];

const STATS = [
  { value: 12000, suffix: "+", label: "Học viên đang học", icon: Users },
  { value: 4800, suffix: "+", label: "Tài liệu chia sẻ", icon: GraduationCap },
  { value: 95000, suffix: "+", label: "Thẻ từ vựng", icon: Star },
  { value: 320, suffix: "+", label: "Server cộng đồng", icon: Globe },
];

// ── Main Landing Page ────────────────────────────────────────
export function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05050a] text-[#e7e9f5]">
      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/8 bg-[#05050a]/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <span className="font-display text-xl font-bold">
            <span className="text-gradient-cyber">EduVerse</span>
          </span>

          {/* Nav links - desktop */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-white/60 md:flex">
            <a href="#features" className="transition hover:text-white">Tính năng</a>
            <a href="#stats" className="transition hover:text-white">Con số</a>
            <Link href="/courses" className="transition hover:text-white">Khoá học</Link>
            <Link href="/marketplace" className="transition hover:text-white">Tài liệu</Link>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white btn-glow-primary"
              >
                Vào Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white sm:block"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white btn-glow-primary"
                >
                  Đăng ký miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
        {/* Star field */}
        <StarField />

        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/25 blur-[100px]" />
          <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-accent/20 blur-[100px]" />
          <div className="absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16">
          {/* Left: text */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass mb-6 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/70"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Nền tảng học tập xã hội thế hệ mới · Hoàn toàn miễn phí
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl xl:text-7xl"
            >
              Học tập,{" "}
              <br className="hidden sm:block" />
              kết nối và
              <br />
              <span className="text-gradient-animated">
                kiến tạo tương lai
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-white/60"
            >
              EduVerse kết hợp Duolingo, Discord, Facebook, Udemy và AI Assistant
              thành một thế giới học tập ảo — nơi bạn học, giao lưu và kiếm tiền từ tri thức.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-base font-semibold text-white btn-glow-primary"
              >
                <Zap className="h-4 w-4" />
                {isLoggedIn ? "Vào Dashboard" : "Bắt đầu miễn phí"}
              </Link>
              <a
                href="#features"
                className="glass flex items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-semibold text-white/80 transition hover:text-white"
              >
                <Play className="h-4 w-4" />
                Xem tính năng
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex items-center gap-4 text-sm text-white/40"
            >
              <div className="flex -space-x-2">
                {["bg-primary/70", "bg-accent/70", "bg-cyan-500/70", "bg-pink-500/70"].map((c, i) => (
                  <div key={i} className={`h-7 w-7 rounded-full border-2 border-[#05050a] ${c}`} />
                ))}
              </div>
              <span>12,000+ học viên đang học mỗi ngày</span>
            </motion.div>
          </div>

          {/* Right: 3D Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <DashboardMockup />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs">Cuộn xuống</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-5 w-5 rounded-full border border-white/20 flex items-center justify-center"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="relative py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-linear-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Tính năng
            </span>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">
              Tất cả trong một nền tảng
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
              Không cần nhảy qua lại nhiều ứng dụng — EduVerse mang mọi thứ bạn cần vào một thế giới học tập duy nhất.
            </p>
          </motion.div>

          {/* Feature grid */}
          <motion.div
            ref={featuresRef}
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, description, color, iconBg, iconColor, glow }) => (
              <motion.div
                key={title}
                variants={cardVariants}
                className={`card-glow group relative overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br ${color} p-6 shadow-xl ${glow} transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Icon */}
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>

                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{description}</p>

                {/* Hover border glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-white/20 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section id="stats" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              Con số
            </span>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">
              Được tin dùng bởi hàng nghìn học viên
            </h2>
          </motion.div>

          <div ref={statsRef} className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map(({ value, suffix, label, icon: Icon }) => (
              <StatCard key={label} target={value} suffix={suffix} label={label} icon={Icon} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/40 via-accent/30 to-cyan-500/20 p-12 text-center shadow-2xl"
          >
            {/* Bg orbs */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-4xl font-bold sm:text-5xl">
                Sẵn sàng bắt đầu
                <br />
                <span className="text-gradient-cyber">hành trình học tập?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                Tham gia cộng đồng EduVerse hoàn toàn miễn phí. Không cần thẻ tín dụng, không ràng buộc.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <Zap className="h-4 w-4" />
                  Đăng ký miễn phí ngay
                </Link>
                <Link
                  href="/login"
                  className="rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Tôi đã có tài khoản
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <span className="font-display text-2xl font-bold">
                <span className="text-gradient-cyber">EduVerse</span>
              </span>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">
                Hệ sinh thái học tập xã hội thế hệ mới — học như Duolingo, trao đổi như Discord, kiếm tiền từ tri thức như Udemy.
              </p>
              <p className="mt-6 text-xs text-white/25">
                © {new Date().getFullYear()} EduVerse. All rights reserved.
              </p>
            </div>

            {/* Sản phẩm */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">Sản phẩm</h4>
              <ul className="space-y-3 text-sm text-white/45">
                {[
                  { href: "/learn", label: "Sổ tay từ vựng" },
                  { href: "/dictionary", label: "Từ điển Trung–Việt" },
                  { href: "/courses", label: "Khoá học" },
                  { href: "/marketplace", label: "Chợ tài liệu" },
                  { href: "/learn/quiz", label: "Mini Quiz" },
                  { href: "/ai", label: "Trợ lý AI" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="transition hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cộng đồng */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">Cộng đồng</h4>
              <ul className="space-y-3 text-sm text-white/45">
                {[
                  { href: "/groups", label: "Server & Nhóm học" },
                  { href: "/dashboard", label: "Bảng tin" },
                  { href: "/leaderboard", label: "Bảng xếp hạng" },
                  { href: "/profile", label: "Trang cá nhân" },
                  { href: "/vip", label: "VIP Club" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="transition hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  target,
  suffix,
  label,
  icon: Icon,
  inView,
}: {
  target: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  inView: boolean;
}) {
  const count = useCounter(target, inView);
  const display = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 text-center"
    >
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="font-display text-4xl font-bold text-white">
        {display}{suffix}
      </p>
      <p className="mt-1.5 text-sm text-white/50">{label}</p>
    </motion.div>
  );
}
