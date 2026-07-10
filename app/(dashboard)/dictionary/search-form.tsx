"use client";

import { useActionState, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { searchAction } from "./actions";
import { DICT_DIRECTIONS, type DictDirection } from "@/src/lib/dictionary";

const DIR_OPTIONS = Object.entries(DICT_DIRECTIONS).map(([key, val]) => ({
  value: key as DictDirection,
  label: val.label,
}));

export function SearchForm({ defaultQ, defaultDir }: { defaultQ?: string; defaultDir?: string }) {
  const [dir, setDir] = useState<DictDirection>((defaultDir as DictDirection) ?? "CN_TO_VI");
  const [, formAction, pending] = useActionState(searchAction, null);
  const info = DICT_DIRECTIONS[dir];

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="dir" value={dir} />

      {/* Language pair selector */}
      <div className="relative">
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <select
          value={dir}
          onChange={(e) => setDir(e.target.value as DictDirection)}
          className="w-full appearance-none rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-primary"
        >
          {DIR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search input + submit */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={defaultQ}
            autoFocus={!defaultQ}
            placeholder={`Nhập ${info.srcLang}...`}
            className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3.5 pl-12 pr-4 text-base outline-none transition focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-2xl bg-primary px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "..." : "Tra"}
        </button>
      </div>
    </form>
  );
}
