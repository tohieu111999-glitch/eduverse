"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Languages, PenLine, Users } from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/dictionary", label: "Dịch", icon: Languages },
  { href: "/exam", label: "Thi thử", icon: PenLine },
  { href: "/learn", label: "Sổ tay", icon: BookOpen },
  { href: "/groups", label: "Cộng đồng", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-foreground/10 bg-surface sm:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted",
            )}
          >
            <Icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
