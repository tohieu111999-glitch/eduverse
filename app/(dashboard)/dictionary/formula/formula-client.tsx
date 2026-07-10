"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const SUBJECTS = ["Toán học", "Vật lý", "Hóa học", "Sinh học", "Địa lý", "Kinh tế", "Khác"];

type FormulaResult = {
  name: string;
  formula: string;
  variables: { symbol: string; meaning: string; unit: string }[];
  description: string;
  examples: string[];
};

export function FormulaClient() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/formula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), subject }),
      });
      const data = await res.json() as { result?: FormulaResult; error?: string };
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
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="VD: định luật Ohm, diện tích hình tròn, F=ma..."
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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Công thức</p>
            <p className="mt-1 text-xl font-bold text-primary">{result.name}</p>
            <div className="mt-2 rounded-xl bg-primary/10 px-4 py-3 text-center">
              <p className="font-mono text-lg font-bold">{result.formula}</p>
            </div>
          </div>

          {result.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ý nghĩa</p>
              <p className="mt-1 text-sm">{result.description}</p>
            </div>
          )}

          {result.variables.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ký hiệu</p>
              <div className="mt-2 space-y-1.5">
                {result.variables.map((v, i) => (
                  <div key={i} className="flex items-baseline gap-2 text-sm">
                    <span className="w-8 shrink-0 font-mono font-bold text-accent">{v.symbol}</span>
                    <span className="flex-1">{v.meaning}</span>
                    {v.unit && (
                      <span className="shrink-0 rounded bg-foreground/8 px-1.5 py-0.5 text-xs font-mono text-muted">{v.unit}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.examples.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ví dụ</p>
              <ul className="mt-2 space-y-1.5">
                {result.examples.map((ex, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="py-6 text-center text-sm text-muted">
          <p>Nhập tên công thức hoặc định luật để tra cứu</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {["F = ma", "E = mc²", "V = IR", "S = πr²", "PV = nRT"].map((hint) => (
              <button
                key={hint}
                onClick={() => { setQuery(hint); }}
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
