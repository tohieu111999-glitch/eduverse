import Link from "next/link";
import { Coins, Search } from "lucide-react";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { UserMenu } from "@/src/components/dashboard/user-menu";
import { ExpBar } from "@/src/components/dashboard/exp-bar";

export function Topbar({
  name,
  avatar,
  username,
  level,
  exp,
  coins,
}: {
  name: string;
  avatar?: string | null;
  username?: string | null;
  level: number;
  exp: number;
  coins: number;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-foreground/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            placeholder="Tìm bài viết, tài liệu, người dùng..."
            className="w-72 rounded-full border border-foreground/10 bg-foreground/5 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="hidden w-48 sm:block">
          <ExpBar level={level} exp={exp} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/topup"
          className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm font-medium transition hover:scale-[1.02]"
        >
          <Coins className="h-4 w-4 text-accent" />
          {coins}
        </Link>
        <ThemeToggle />
        <UserMenu name={name} avatar={avatar} username={username} />
      </div>
    </header>
  );
}
