import { cn } from "@/src/lib/utils";

export type ButtonVariant = "primary" | "glass" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "gradient-cyber text-white shadow-lg shadow-primary/30 hover:opacity-90",
  glass: "glass hover:bg-white/10",
  ghost: "hover:bg-foreground/5",
};

export function buttonVariants(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonVariants(variant, className)} {...props} />;
}
