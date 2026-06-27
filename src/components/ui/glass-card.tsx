import { cn } from "@/src/lib/utils";

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-2xl shadow-xl shadow-black/5", className)} {...props} />;
}
