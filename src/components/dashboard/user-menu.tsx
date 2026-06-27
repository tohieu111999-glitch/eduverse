"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Banknote, Coins, Crown, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function UserMenu({
  name,
  avatar,
  username,
}: {
  name: string;
  avatar?: string | null;
  username?: string | null;
}) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-full glass px-2 py-1.5 pr-3 transition hover:scale-[1.02]">
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full gradient-cyber text-xs font-semibold text-white">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <span className="text-sm font-medium">{name}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "glass z-50 min-w-48 rounded-xl p-1.5 text-sm shadow-xl",
            "data-[state=open]:animate-fade-in",
          )}
        >
          <DropdownMenu.Item asChild>
            <Link href={username ? `/profile/${username}` : "/profile"} className="flex items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-foreground/5">
              <User className="h-4 w-4" />
              {username ? `@${username}` : "Trang cá nhân"}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/topup" className="flex items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-foreground/5">
              <Coins className="h-4 w-4" />
              Nạp Coin
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/withdraw" className="flex items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-foreground/5">
              <Banknote className="h-4 w-4" />
              Rút Coin
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/vip" className="flex items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-foreground/5">
              <Crown className="h-4 w-4" />
              EduVerse VIP
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-foreground/5">
              <Settings className="h-4 w-4" />
              Cài đặt
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-foreground/10" />
          <DropdownMenu.Item
            onSelect={() => signOut({ redirectTo: "/" })}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-500 outline-none hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
