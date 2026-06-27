import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Search, Users } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { isVip } from "@/src/lib/vip";
import { GlassCard } from "@/src/components/ui/glass-card";
import { UserRow } from "./user-row";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      role: true,
      isBanned: true,
      vipLevel: true,
      vipExpiresAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Quản lý người dùng</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quản trị
        </Link>
      </div>

      <form className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Tìm theo tên, tên đăng nhập hoặc email..."
          className="w-full rounded-full border border-foreground/10 bg-foreground/5 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </form>

      <GlassCard className="divide-y divide-foreground/10 p-2">
        {users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Không tìm thấy người dùng nào.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-4 px-3 py-3">
              <div>
                <p className="text-sm font-medium">
                  {user.displayName ?? user.username ?? "Người dùng"}{" "}
                  {user.isBanned && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-500">Đã khoá</span>
                  )}
                  {isVip(user) && (
                    <span className="ml-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                      {user.vipLevel === "VIP_PLUS" ? "VIP+" : "VIP"}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  @{user.username} · {user.email}
                </p>
              </div>
              <UserRow userId={user.id} isBanned={user.isBanned} role={user.role} isSelf={user.id === session.user.id} />
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}
