import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { requireAdmin } from "@/src/lib/admin";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { AutoApproveToggle } from "./auto-approve-toggle";

export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const settings = await prisma.platformSettings.findUnique({ where: { id: "default" } });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-muted" />
          <h1 className="text-xl font-semibold">Cài đặt hệ thống</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Quản trị
        </Link>
      </div>

      <GlassCard className="p-6">
        <AutoApproveToggle enabled={settings?.autoApproveTopups ?? false} />
      </GlassCard>
    </div>
  );
}
