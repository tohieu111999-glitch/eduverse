"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  Loader2,
  Volume2,
  X,
} from "lucide-react";
import { GlassCard } from "@/src/components/ui/glass-card";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", ttsLang: "vi-VN" },
  { code: "zh-CN", label: "Trung (Giản thể)", flag: "🇨🇳", ttsLang: "zh-CN" },
  { code: "zh-TW", label: "Trung (Phồn thể)", flag: "🇹🇼", ttsLang: "zh-TW" },
  { code: "en", label: "Tiếng Anh", flag: "🇬🇧", ttsLang: "en-US" },
  { code: "ja", label: "Tiếng Nhật", flag: "🇯🇵", ttsLang: "ja-JP" },
  { code: "ko", label: "Tiếng Hàn", flag: "🇰🇷", ttsLang: "ko-KR" },
  { code: "fr", label: "Tiếng Pháp", flag: "🇫🇷", ttsLang: "fr-FR" },
  { code: "de", label: "Tiếng Đức", flag: "🇩🇪", ttsLang: "de-DE" },
  { code: "es", label: "Tiếng Tây Ban Nha", flag: "🇪🇸", ttsLang: "es-ES" },
] as const;

type LangCode = (typeof LANGUAGES)[number]["code"];

function getLang(code: LangCode) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

function LangSelect({
  value,
  onChange,
  exclude,
}: {
  value: LangCode;
  onChange: (v: LangCode) => void;
  exclude?: LangCode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = getLang(value);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm font-medium transition hover:bg-foreground/8"
      >
        <span>{current.flag}</span>
        <span className="max-w-[120px] truncate">{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full z-30 mt-1 w-52 overflow-hidden rounded-xl border border-foreground/10 bg-surface shadow-xl">
          {LANGUAGES.filter((l) => l.code !== exclude).map((l) => (
            <button
              key={l.code}
              onClick={() => { onChange(l.code); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-foreground/8
                ${l.code === value ? "bg-primary/10 text-primary font-semibold" : "text-foreground/80"}`}
            >
              <span>{l.flag}</span>
              {l.label}
              {l.code === value && <Check className="ml-auto h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

type TranslateResult = { translation: string; pinyin: string | null } | null;

export function TranslateClient({
  dailyUsed,
  isVip,
}: {
  dailyUsed: number;
  isVip: boolean;
}) {
  const FREE_LIMIT = 20;
  const [srcLang, setSrcLang] = useState<LangCode>("vi");
  const [tgtLang, setTgtLang] = useState<LangCode>("zh-CN");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslateResult>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usedToday, setUsedToday] = useState(dailyUsed);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translate = useCallback(
    async (inputText: string, src: LangCode, tgt: LangCode) => {
      if (!inputText.trim()) { setResult(null); setError(null); return; }
      if (!isVip && usedToday >= FREE_LIMIT) {
        setError(`Bạn đã dùng hết ${FREE_LIMIT} lượt dịch hôm nay. Nâng cấp VIP để dịch không giới hạn.`);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText, srcLang: src, tgtLang: tgt }),
        });
        const data = await res.json() as { translation?: string; pinyin?: string | null; error?: string };
        if (!res.ok || data.error) {
          setError(data.error ?? "Dịch thất bại");
          setResult(null);
        } else {
          setResult({ translation: data.translation ?? "", pinyin: data.pinyin ?? null });
          setUsedToday((n) => n + 1);
        }
      } catch {
        setError("Lỗi kết nối, vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [isVip, usedToday]
  );

  // Debounce: auto-translate 1s after stop typing
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!text.trim()) { setResult(null); setError(null); return; }
    timerRef.current = setTimeout(() => translate(text, srcLang, tgtLang), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, srcLang, tgtLang]);

  function swap() {
    setSrcLang(tgtLang);
    setTgtLang(srcLang);
    setText(result?.translation ?? text);
    setResult(null);
  }

  function handleCopy() {
    if (!result?.translation) return;
    navigator.clipboard.writeText(result.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const tgtInfo = getLang(tgtLang);
  const charCount = text.length;
  const limitReached = !isVip && usedToday >= FREE_LIMIT;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Dịch văn bản</h1>
        </div>
        <Link
          href="/translate/history"
          className="flex items-center gap-1.5 rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-medium text-muted transition hover:text-foreground"
        >
          <Clock className="h-3.5 w-3.5" />
          Lịch sử
        </Link>
      </div>

      {/* Usage badge */}
      {!isVip && (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-2 text-xs
          ${limitReached
            ? "border-red-500/30 bg-red-500/10 text-red-400"
            : usedToday >= FREE_LIMIT * 0.8
            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
            : "border-foreground/10 bg-foreground/5 text-muted"
          }`}
        >
          <span>Đã dùng {usedToday}/{FREE_LIMIT} lượt hôm nay</span>
          {limitReached && (
            <Link href="/vip" className="font-semibold underline-offset-2 hover:underline">
              Nâng cấp VIP →
            </Link>
          )}
        </div>
      )}

      {/* Input area */}
      <GlassCard className="overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={3000}
          rows={6}
          disabled={limitReached}
          placeholder="Nhập văn bản cần dịch..."
          className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-sm outline-none placeholder:text-muted/60 disabled:opacity-50"
        />
        <div className="flex items-center justify-between border-t border-foreground/10 px-4 py-2">
          <span className="text-xs text-muted">{charCount}/3000</span>
          {text && (
            <button
              onClick={() => { setText(""); setResult(null); setError(null); }}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition hover:bg-foreground/8 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Xoá
            </button>
          )}
        </div>
      </GlassCard>

      {/* Language selector bar */}
      <div className="flex items-center gap-3">
        <LangSelect value={srcLang} onChange={setSrcLang} exclude={tgtLang} />
        <button
          onClick={swap}
          title="Đảo chiều dịch"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 transition hover:border-primary hover:text-primary"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <LangSelect value={tgtLang} onChange={setTgtLang} exclude={srcLang} />
      </div>

      {/* Result area */}
      {loading && (
        <GlassCard className="flex items-center gap-3 px-5 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted">Đang dịch...</span>
        </GlassCard>
      )}

      {error && !loading && (
        <GlassCard className="border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
          {error}
        </GlassCard>
      )}

      {result && !loading && !error && (
        <GlassCard className="space-y-4 p-5">
          {/* Translation text */}
          <div>
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted">
              {tgtInfo.flag} {tgtInfo.label}
            </p>
            <p className="whitespace-pre-wrap text-base leading-relaxed">{result.translation}</p>
          </div>

          {/* Pinyin */}
          {result.pinyin && (
            <div className="rounded-xl bg-foreground/5 px-4 py-3">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted">Pinyin</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{result.pinyin}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2 text-xs font-medium text-muted transition hover:border-primary hover:text-primary"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Đã copy!" : "Sao chép"}
            </button>
            <button
              onClick={() => speak(result.translation, tgtInfo.ttsLang)}
              className="flex items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2 text-xs font-medium text-muted transition hover:border-primary hover:text-primary"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Phát âm
            </button>
            <button
              onClick={() => speak(text, getLang(srcLang).ttsLang)}
              className="flex items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2 text-xs font-medium text-muted transition hover:border-primary hover:text-primary"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Gốc
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
