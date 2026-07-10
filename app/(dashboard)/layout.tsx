import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { Sidebar } from "@/src/components/dashboard/sidebar";
import { Topbar } from "@/src/components/dashboard/topbar";
import { MobileNav } from "@/src/components/dashboard/mobile-nav";
import { SocketProvider } from "@/src/components/realtime/socket-provider";
import { CallProvider } from "@/src/components/realtime/call-provider";
import { CallUI } from "@/src/components/realtime/call-ui";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Level/EXP change on almost every gamified action, so they're read fresh
  // from the DB here rather than from the JWT session, which only carries
  // the values from the moment the user last signed in.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, username: true, avatar: true, level: true, exp: true, coins: true },
  });
  if (!user) redirect("/login");

  return (
    <SocketProvider>
      <CallProvider>
        <div className="flex flex-1">
          <Sidebar isAdmin={session.user.role === "ADMIN"} role={session.user.role} />
          <div className="flex flex-1 flex-col">
            <Topbar
              name={user.displayName ?? user.username ?? "Bạn"}
              avatar={user.avatar}
              username={user.username}
              level={user.level}
              exp={user.exp}
              coins={user.coins}
            />
            {/* pb-20 on mobile to avoid content hiding behind the fixed bottom nav */}
            <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-6">{children}</main>
          </div>
        </div>
        <CallUI />
        <MobileNav />
      </CallProvider>
    </SocketProvider>
  );
}
