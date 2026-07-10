import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, NotebookText } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { GlassCard } from "@/src/components/ui/glass-card";
import { GrammarClient } from "./grammar-client";

export default async function GrammarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dictionary" className="rounded-xl p-2 text-muted transition hover:bg-foreground/5">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <NotebookText className="h-5 w-5 text-primary" />
          Tra ngữ pháp
        </h1>
      </div>

      <GlassCard className="p-5">
        <GrammarClient />
      </GlassCard>
    </div>
  );
}
