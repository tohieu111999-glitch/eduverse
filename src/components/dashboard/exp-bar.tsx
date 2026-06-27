import { cn } from "@/src/lib/utils";
import { expForLevel, levelTitle } from "@/src/lib/utils";

export function ExpBar({ level, exp, className }: { level: number; exp: number; className?: string }) {
  const needed = expForLevel(level);
  const percent = Math.min(100, Math.round((exp / needed) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>
          Lv{level} · {levelTitle(level)}
        </span>
        <span>
          {exp}/{needed} EXP
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
        <div className="h-full gradient-cyber transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
