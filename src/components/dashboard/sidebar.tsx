"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  PlayCircle,
  School,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Bảng tin", icon: LayoutDashboard },
  { href: "/marketplace", label: "Chợ tài liệu", icon: ShoppingBag },
  { href: "/groups", label: "Nhóm & Server", icon: Users },
  { href: "/messages", label: "Tin nhắn", icon: MessageCircle },
  { href: "/learn", label: "Học tập", icon: BookOpenCheck },
  { href: "/courses", label: "Khoá học", icon: PlayCircle },
  { href: "/ai", label: "Trợ lý AI", icon: Sparkles },
  { href: "/leaderboard", label: "Xếp hạng", icon: Trophy },
  { href: "/profile", label: "Trang cá nhân", icon: User },
];

export function Sidebar({ isAdmin, role }: { isAdmin?: boolean; role?: string }) {
  const pathname = usePathname();
  let items = NAV_ITEMS;
  if (role === "TEACHER" || role === "STUDENT") {
    items = [...items, { href: "/classroom", label: "Lớp học", icon: GraduationCap }];
  }
  if (role === "SCHOOL_ADMIN") {
    items = [...items, { href: "/school", label: "Trường học", icon: School }];
  }
  if (isAdmin) {
    items = [...items, { href: "/admin", label: "Quản trị", icon: ShieldCheck }];
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-1 border-r border-foreground/10 p-4 sm:flex">
      <Link href="/" className="mb-6 px-2 font-display text-xl font-bold">
        <span className="text-gradient-cyber">EduVerse</span>
      </Link>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "glass text-foreground" : "text-muted hover:bg-foreground/5",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
