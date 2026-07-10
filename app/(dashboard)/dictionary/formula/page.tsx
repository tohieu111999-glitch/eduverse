import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { GlassCard } from "@/src/components/ui/glass-card";
import { FormulaClient } from "./formula-client";

export default async function FormulaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dictionary" className="rounded-xl p-2 text-muted transition hover:bg-foreground/5">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Calculator className="h-5 w-5 text-accent" />
          Tra công thức
        </h1>
      </div>

      <GlassCard className="p-5">
        <FormulaClient />
      </GlassCard>
    </div>
  );
}
