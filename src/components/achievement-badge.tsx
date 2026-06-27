import { BookOpenCheck, Coins, Crown, FileText, PenLine, ShoppingBag, Trophy, Users, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  FileText,
  PenLine,
  ShoppingBag,
  BookOpenCheck,
  Coins,
  Users,
  Trophy,
  Crown,
};

export function AchievementBadge({ icon, name, description }: { icon: string; name: string; description: string }) {
  const Icon = ICONS[icon] ?? Trophy;

  return (
    <div title={description} className="flex flex-col items-center gap-1.5 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-cyber">
        <Icon className="h-5 w-5 text-white" />
      </span>
      <span className="max-w-[5rem] truncate text-xs text-muted">{name}</span>
    </div>
  );
}
