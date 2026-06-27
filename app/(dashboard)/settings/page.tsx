import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { TwoFactorSection } from "./two-factor-section";
import { AvatarSection } from "./avatar-section";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, avatar: true, username: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="mb-6 flex items-center gap-3">
        <Settings className="h-6 w-6 text-accent" />
        <h1 className="text-xl font-semibold">Cài đặt</h1>
      </div>

      <GlassCard className="p-6">
        <h2 className="mb-4 text-sm font-medium text-muted">Ảnh đại diện</h2>
        <AvatarSection currentAvatar={user.avatar} username={user.username ?? ""} />
      </GlassCard>

      <GlassCard className="p-6">
        <TwoFactorSection enabled={user.twoFactorEnabled} />
      </GlassCard>
    </div>
  );
}
