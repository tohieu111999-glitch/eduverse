import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { JoinButton } from "./join-button";

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const servers = await prisma.server.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      channels: { orderBy: { createdAt: "asc" }, take: 1 },
      members: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { members: true } },
    },
  });

  const myServers = servers.filter((s) => s.members.length > 0);
  const otherServers = servers.filter((s) => s.members.length === 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Nhóm & Server</h1>
        </div>
        <Link href="/groups/create" className={buttonVariants("primary")}>
          <Plus className="h-4 w-4" />
          Tạo nhóm
        </Link>
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted">Nhóm của bạn</h2>
      {myServers.length === 0 ? (
        <p className="mb-6 text-sm text-muted">Bạn chưa tham gia nhóm nào.</p>
      ) : (
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          {myServers.map((s) => (
            <Link key={s.id} href={`/groups/${s.id}/${s.channels[0]?.id ?? ""}`}>
              <GlassCard className="p-4 transition hover:-translate-y-0.5">
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-xs text-muted">{s._count.members} thành viên</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mb-3 text-sm font-medium text-muted">Khám phá nhóm khác</h2>
      {otherServers.length === 0 ? (
        <p className="text-sm text-muted">Không có nhóm nào khác để tham gia.</p>
      ) : (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {otherServers.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-3 py-3">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted">{s._count.members} thành viên</p>
              </div>
              <JoinButton serverId={s.id} />
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
