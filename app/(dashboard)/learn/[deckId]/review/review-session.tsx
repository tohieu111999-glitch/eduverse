"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReviewAction } from "./actions";
import { QUALITY_LABELS, type Quality } from "@/src/lib/srs";
import { GlassCard } from "@/src/components/ui/glass-card";
import { Check, Star, Volume2 } from "lucide-react";

export type SessionCard = {
  id: string;
  front: string;
  back: string;
  pinyin?: string;
  hanViet?: string;
  example?: { zh: string; pinyin: string; vi: string } | null;
};

function speak(text: string, lang = "zh-CN") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

const QUALITY_COLORS = [
  "border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
  "border-orange-400/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20",
  "border-blue-400/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20",
  "border-green-400/40 bg-green-500/10 text-green-300 hover:bg-green-500/20",
];

type Props = { deckId: string; cards: SessionCard[]; deckLanguage?: string; returnUrl?: string };

export function ReviewSession({ deckId, cards, deckLanguage = "zh-CN", returnUrl }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [totalExp, setTotalExp] = useState(0);

  const card = cards[index];
  const isRich = !!(card?.pinyin || card?.hanViet);
  const progress = ((index) / cards.length) * 100;

  async function handleRate(quality: Quality) {
    setPending(true);
    await submitReviewAction(card.id, quality);
    setPending(false);
    setTotalExp((e) => e + 1);

    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  if (done) {
    return (
      <GlassCard className="p-8 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
          <Check className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <p className="text-xl font-bold">Hoàn thành!</p>
          <p className="mt-1 text-sm text-muted">Bạn đã ôn tập {cards.length} thẻ hôm nay</p>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-3">
          <Star className="h-5 w-5 text-amber-400" />
          <span className="text-lg font-bold text-primary">+{totalExp} EXP</span>
        </div>
        <button
          onClick={() => router.push(returnUrl ?? `/learn/${deckId}`)}
          className="mt-2 w-full rounded-xl bg-primary py-3 font-semibold text-white transition hover:opacity-90"
        >
          {returnUrl === "/learn" ? "Về trang Sổ tay" : "Quay lại bộ thẻ"}
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-muted">{index + 1}/{cards.length}</span>
      </div>

      {/* Card */}
      <GlassCard
        className="min-h-56 cursor-pointer overflow-hidden"
        onClick={() => { if (!window.getSelection()?.toString()) setFlipped((f) => !f); }}
      >
        {/* Front */}
        {!flipped ? (
          <div className="flex flex-col items-center justify-center p-8 h-56 text-center">
            <p className="text-6xl font-bold leading-tight">{card.front}</p>
            <button
              onClick={(e) => { e.stopPropagation(); speak(card.front, deckLanguage); }}
              className="mt-4 flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1.5 text-xs text-muted transition hover:bg-foreground/10 hover:text-foreground"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Phát âm
            </button>
          </div>
        ) : (
          /* Back */
          <div className="p-6 space-y-4">
            {isRich ? (
              <>
                {/* Pinyin + Hán Việt header */}
                <div className="text-center">
                  <p className="text-3xl font-bold">{card.front}</p>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); speak(card.front, deckLanguage); }}
                      className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition"
                    >
                      <Volume2 className="h-4 w-4" />
                      {card.pinyin}
                    </button>
                  </div>
                  {card.hanViet && (
                    <p className="mt-1 text-xs text-muted">
                      {deckLanguage === "zh-CN" || deckLanguage === "zh-TW" ? "Hán Việt" :
                       deckLanguage === "ja-JP" ? "Hiragana" :
                       deckLanguage === "ko-KR" ? "Hanja" :
                       deckLanguage === "en-US" ? "Loại từ" : "Ghi chú"}
                      {": "}{card.hanViet}
                    </p>
                  )}
                </div>
                {/* Meaning */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-center">
                  <p className="font-semibold">{card.back}</p>
                </div>
                {/* Example */}
                {card.example && (
                  <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{card.example.zh}</p>
                        <p className="text-xs text-muted mt-0.5">{card.example.pinyin}</p>
                        <p className="text-xs text-foreground/70 mt-1">{card.example.vi}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(card.example!.zh, deckLanguage); }}
                        className="shrink-0 text-muted hover:text-primary transition"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Plain card back */
              <div className="flex min-h-40 items-center justify-center text-center p-4">
                <p className="text-lg font-medium">{card.back}</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Action buttons */}
      {!flipped ? (
        <button
          onClick={() => setFlipped(true)}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition hover:opacity-90"
        >
          Lật thẻ
        </button>
      ) : (
        <div>
          <p className="mb-2 text-center text-xs text-muted">Bạn nhớ từ này ở mức nào?</p>
          <div className="grid grid-cols-4 gap-2">
            {QUALITY_LABELS.map(({ value, label }, i) => (
              <button
                key={value}
                disabled={pending}
                onClick={() => handleRate(value)}
                className={`rounded-xl border py-3 text-xs font-semibold transition disabled:opacity-50 ${QUALITY_COLORS[i]}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
