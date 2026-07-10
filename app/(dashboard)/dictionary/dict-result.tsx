"use client";

import { Volume2 } from "lucide-react";
import type { DictResult } from "@/src/lib/dictionary";
import type { FlashcardDeck } from "@prisma/client";
import { SaveDialog } from "./save-dialog";

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

type Props = {
  result: DictResult;
  decks: Pick<FlashcardDeck, "id" | "name">[];
  ttsLang?: string;
};

export function DictResultCard({ result, decks, ttsLang = "zh-CN" }: Props) {
  if (result.notFound && !result.simplified) {
    return (
      <div className="glass rounded-2xl p-6 text-center text-muted">
        <p className="text-sm">Không tìm thấy kết quả cho từ này.</p>
        <p className="mt-1 text-xs">Hãy thử từ khóa khác hoặc kiểm tra lại cách viết.</p>
      </div>
    );
  }

  const flashFront = result.simplified
    ? `${result.simplified}${result.traditional !== result.simplified ? ` / ${result.traditional}` : ""} (${result.pinyin})`
    : result.pinyin;
  const flashBack = result.meanings.join("; ");

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-linear-to-br from-blue-950 via-blue-900 to-indigo-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-white">{result.simplified}</span>
              {result.traditional && result.traditional !== result.simplified && (
                <span className="text-xl text-blue-200">{result.traditional}</span>
              )}
            </div>
            {result.pinyin && (
              <button
                onClick={() => speak(result.simplified || result.pinyin, ttsLang)}
                className="mt-2 flex items-center gap-1.5 text-sm text-blue-200 transition hover:text-white"
              >
                <Volume2 className="h-4 w-4" />
                {result.pinyin}
              </button>
            )}
            {result.hanViet && (
              <p className="mt-1 text-xs text-blue-300">{result.hanViet}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {result.partOfSpeech.map((pos) => (
              <span key={pos} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                {pos}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Meanings */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Nghĩa</h3>
          <ol className="space-y-1">
            {result.meanings.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm">
                {result.meanings.length > 1 && (
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                )}
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </div>

        {result.examples.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Ví dụ</h3>
            <div className="space-y-3">
              {result.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-foreground/10 bg-foreground/5 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ex.zh}</p>
                      {ex.pinyin && <p className="text-xs text-muted mt-0.5">{ex.pinyin}</p>}
                      <p className="text-xs text-foreground/70 mt-1">{ex.vi}</p>
                    </div>
                    {ex.zh && (
                      <button
                        onClick={() => speak(ex.zh, ttsLang)}
                        className="shrink-0 text-muted hover:text-primary transition"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save to flashcard */}
        {!result.notFound && (
          <div className="flex justify-end border-t border-foreground/10 pt-4">
            <SaveDialog front={flashFront} back={flashBack} decks={decks} />
          </div>
        )}
      </div>
    </div>
  );
}
