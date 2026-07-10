"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Languages, Maximize2, Mic, PenLine, Search } from "lucide-react";
import toast from "react-hot-toast";

export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<"CN" | "VI">("CN");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    if (q) router.push(`/dictionary?q=${encodeURIComponent(q)}`);
    else router.push("/dictionary");
  }

  function comingSoon() {
    toast("Tính năng sắp ra mắt 🚀", { icon: "⏳" });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            placeholder={lang === "CN" ? "Nhập tiếng Trung..." : "Nhập tiếng Việt..."}
            className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3.5 pl-12 pr-4 text-base outline-none focus:border-primary focus:bg-foreground/8 transition"
          />
        </div>
        <button
          type="button"
          onClick={() => setLang((l) => (l === "CN" ? "VI" : "CN"))}
          className="flex shrink-0 items-center gap-1 rounded-2xl border border-foreground/10 bg-foreground/5 px-3 py-3.5 text-sm font-semibold transition hover:border-primary hover:text-primary"
        >
          <Languages className="h-4 w-4" />
          {lang === "CN" ? "CN→VI" : "VI→CN"}
        </button>
      </form>

      <div className="flex gap-3">
        {[
          { icon: Camera, label: "OCR" },
          { icon: Mic, label: "Giọng nói" },
          { icon: PenLine, label: "Viết tay" },
          { icon: Maximize2, label: "Mở rộng" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={comingSoon}
            title={label}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 transition hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
}
