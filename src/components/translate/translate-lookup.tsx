"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Languages, X } from "lucide-react";
import { lookupTranslationAction } from "@/src/lib/translate-actions";

type Popup = { x: number; y: number; text: string };
type Result = { loading: boolean; translation?: string; error?: string; chargedCoins?: number };

// Wraps any text content to enable "select text -> translate" lookups via
// the AI assistant. Drop this around flashcards, quiz prompts, or document
// viewer pages — selection works the same everywhere since it's plain DOM
// text selection, not anything content-specific.
export function TranslateLookup({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!text || !selection || selection.rangeCount === 0) return;
    if (!containerRef.current?.contains(selection.anchorNode)) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    setPopup({ x: rect.left + rect.width / 2, y: rect.top, text });
    setResult(null);
  }, []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (popupRef.current?.contains(e.target as Node)) return;
      setPopup(null);
      setResult(null);
    }
    if (popup) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [popup]);

  async function handleTranslate() {
    if (!popup) return;
    setResult({ loading: true });
    const res = await lookupTranslationAction(popup.text);
    setResult(
      res.error ? { loading: false, error: res.error } : { loading: false, translation: res.translation, chargedCoins: res.chargedCoins },
    );
  }

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp} className={className}>
      {children}

      {popup && (
        <div
          ref={popupRef}
          className="glass fixed z-50 w-64 -translate-x-1/2 -translate-y-full rounded-xl p-3 text-sm shadow-xl"
          style={{ left: popup.x, top: popup.y - 10 }}
        >
          <div className="mb-1 flex items-center justify-between">
            <p className="truncate text-xs text-muted">&quot;{popup.text}&quot;</p>
            <button
              onClick={() => {
                setPopup(null);
                setResult(null);
              }}
              className="shrink-0 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {!result && (
            <button
              onClick={handleTranslate}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg gradient-cyber px-3 py-1.5 text-xs font-medium text-white"
            >
              <Languages className="h-3.5 w-3.5" />
              Dịch
            </button>
          )}
          {result?.loading && <p className="text-xs text-muted">Đang dịch...</p>}
          {result?.error && <p className="text-xs text-red-500">{result.error}</p>}
          {result?.translation && (
            <>
              <p className="font-medium">{result.translation}</p>
              {Boolean(result.chargedCoins) && <p className="mt-1 text-xs text-muted">-{result.chargedCoins} coin</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
