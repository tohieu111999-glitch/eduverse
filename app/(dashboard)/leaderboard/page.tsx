import Link from "next/link";
import { Trophy } from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { levelTitle } from "@/src/lib/utils";

const RANK_COLORS = ["text-yellow-400", "text-zinc-300", "text-amber-600"];

export default async function LeaderboardPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ level: "desc" }, { exp: "desc" }],
    take: 50,
    select: { id: true, displayName: true, username: true, avatar: true, level: true, exp: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Trophy className="h-6 w-6 text-accent" />
        <h1 className="text-xl font-semibold">Bảng xếp hạng</h1>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-muted">Chưa có dữ liệu xếp hạng.</p>
      ) : (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {users.map((user, index) => {
            const name = user.displayName ?? user.username ?? "Người dùng EduVerse";
            const row = (
              <>
                <span className={`w-6 text-center text-sm font-bold ${RANK_COLORS[index] ?? "text-muted"}`}>
                  {index + 1}
                </span>
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full gradient-cyber text-xs font-semibold text-white">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted">{levelTitle(user.level)}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">Lv{user.level}</p>
                  <p className="text-xs text-muted">{user.exp} EXP</p>
                </div>
              </>
            );

            return user.username ? (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-4 px-3 py-3 transition hover:bg-foreground/5"
              >
                {row}
              </Link>
            ) : (
              <div key={user.id} className="flex items-center gap-4 px-3 py-3">
                {row}
              </div>
            );
          })}
        </GlassCard>
      )}
    </div>
  );
}
