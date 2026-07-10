"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const LANGUAGES = ["Tiếng Anh", "Tiếng Trung", "Tiếng Nhật", "Tiếng Hàn", "Tiếng Pháp", "Tiếng Việt", "Khác"];

type GrammarResult = {
  structure: string;
  meaning: string;
  usage: string;
  examples: { sentence: string; translation: string; note?: string }[];
  notes?: string;
};

export function GrammarClient() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), language }),
      });
      const data = await res.json() as { result?: GrammarResult; error?: string };
      if (data.error) setError(data.error);
      else if (data.result) setResult(data.result);
    } catch {
      setError("Mất kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") lookup();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
        </select>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="VD: thì hiện tại hoàn thành, て-form, passive voice..."
              className="w-full rounded-xl border border-foreground/10 bg-foreground/5 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
              autoFocus
            />
          </div>
          <button
            onClick={lookup}
            disabled={loading || !query.trim()}
            className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "..." : "Tra"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
      )}

      {result && (
        <div className="space-y-4 rounded-xl border border-foreground/10 bg-foreground/3 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cấu trúc</p>
            <div className="mt-2 rounded-xl bg-primary/10 px-4 py-3">
              <p className="font-mono font-bold text-primary">{result.structure}</p>
            </div>
            <p className="mt-2 text-sm font-medium">{result.meaning}</p>
          </div>

          {result.usage && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cách dùng</p>
              <p className="mt-1 text-sm">{result.usage}</p>
            </div>
          )}

          {result.examples.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ví dụ</p>
              <div className="mt-2 space-y-3">
                {result.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-foreground/10 bg-foreground/5 p-3">
                    <p className="font-medium text-sm">{ex.sentence}</p>
                    <p className="mt-1 text-xs text-muted">{ex.translation}</p>
                    {ex.note && <p className="mt-1 text-xs text-accent">{ex.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.notes && (
            <div className="rounded-xl bg-amber-500/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Lưu ý</p>
              <p className="mt-1 text-sm">{result.notes}</p>
            </div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="py-6 text-center text-sm text-muted">
          <p>Nhập cấu trúc ngữ pháp để tra cứu giải thích và ví dụ</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {["Have + V3", "もの・こと", "Subject + Verb + Object", "Ne... pas", "因为...所以..."].map((hint) => (
              <button
                key={hint}
                onClick={() => setQuery(hint)}
                className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs transition hover:border-primary hover:text-primary"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
