"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Calculator,
  GraduationCap,
  Languages,
  LayoutDashboard,
  MessageCircle,
  NotebookText,
  PenLine,
  PlayCircle,
  School,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
  Users,
  Users2,
  FileText,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Bảng tin", icon: LayoutDashboard },
  { href: "/community", label: "Cộng đồng", icon: Users2 },
  { href: "/marketplace", label: "Chợ tài liệu", icon: ShoppingBag },
  { href: "/groups", label: "Nhóm & Server", icon: Users },
  { href: "/messages", label: "Tin nhắn", icon: MessageCircle },
  { href: "/learn", label: "Sổ tay", icon: BookOpenCheck },
  { href: "/dictionary", label: "Từ điển", icon: Languages },
  { href: "/dictionary/formula", label: "Tra công thức", icon: Calculator },
  { href: "/dictionary/grammar", label: "Tra ngữ pháp", icon: NotebookText },
  { href: "/translate", label: "Dịch văn bản", icon: FileText },
  { href: "/courses", label: "Khoá học", icon: PlayCircle },
  { href: "/exam", label: "Thi thử", icon: PenLine },
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
        const active =
          pathname === href ||
          (href !== "/dictionary" && href !== "/exam" && href !== "/translate" && href !== "/community" && pathname.startsWith(`${href}/`)) ||
          (href === "/community" && pathname.startsWith("/community")) ||
          (href === "/exam" && pathname.startsWith("/exam")) ||
          (href === "/translate" && pathname.startsWith("/translate")) ||
          (href === "/dictionary" && (pathname === "/dictionary" || pathname === "/dictionary/history"));
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
