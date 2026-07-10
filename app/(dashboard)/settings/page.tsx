import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { TwoFactorSection } from "./two-factor-section";
import { AvatarSection } from "./avatar-section";
import { BankSection } from "./bank-section";
import { UserSettingsForm } from "./user-settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      twoFactorEnabled: true,
      avatar: true,
      username: true,
      bankName: true,
      bankBin: true,
      bankAccount: true,
      bankAccountName: true,
      settings: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <UserSettingsForm defaultValues={user.settings ?? {}} />

      {/* ── Avatar ─────────────────────────────────────────── */}
      <GlassCard className="p-6">
        <h2 className="mb-4 text-sm font-medium text-muted">Ảnh đại diện</h2>
        <AvatarSection currentAvatar={user.avatar} username={user.username ?? ""} />
      </GlassCard>

      {/* ── Ngân hàng ──────────────────────────────────────── */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-medium">Tài khoản ngân hàng</h2>
        </div>
        <BankSection
          bankName={user.bankName}
          bankBin={user.bankBin}
          bankAccount={user.bankAccount}
          bankAccountName={user.bankAccountName}
        />
      </GlassCard>

      {/* ── 2FA ────────────────────────────────────────────── */}
      <GlassCard className="p-6">
        <TwoFactorSection enabled={user.twoFactorEnabled} />
      </GlassCard>
    </div>
  );
}
