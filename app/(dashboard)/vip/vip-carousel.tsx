"use client";

import { useEffect, useState } from "react";
import { Monitor, Sparkles, ZapOff } from "lucide-react";

const SLIDES = [
  {
    icon: Monitor,
    title: "Mua một lần, dùng trên nhiều thiết bị",
    desc: "Đăng nhập ở đâu là học ngay ở đó — điện thoại, máy tính, tablet.",
    gradient: "from-blue-900 via-blue-800 to-indigo-900",
    accent: "bg-blue-500/20 text-blue-300",
  },
  {
    icon: Sparkles,
    title: "AI không giới hạn",
    desc: "Trợ lý AI, dịch văn bản, tra từ điển — dùng bao nhiêu tuỳ thích.",
    gradient: "from-purple-900 via-purple-800 to-pink-900",
    accent: "bg-purple-500/20 text-purple-300",
  },
  {
    icon: ZapOff,
    title: "Không quảng cáo, tập trung học",
    desc: "Học tập không bị gián đoạn, tải nhanh hơn, trải nghiệm sạch hơn.",
    gradient: "from-red-900 via-red-800 to-orange-900",
    accent: "bg-red-500/20 text-red-300",
  },
] as const;

export function VipCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[active];

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className={`relative bg-linear-to-br ${slide.gradient} p-6 transition-all duration-500`}
        style={{ minHeight: "160px" }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-6 left-4 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-start gap-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${slide.accent}`}>
            <slide.icon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white leading-snug">{slide.title}</h2>
            <p className="mt-1 text-sm text-white/70 leading-relaxed">{slide.desc}</p>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
