"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { changeRoleAction, toggleBanAction } from "./actions";
import { Button } from "@/src/components/ui/button";

type Role = "USER" | "STUDENT" | "TEACHER" | "SCHOOL_ADMIN" | "MODERATOR" | "ADMIN";

export function UserRow({
  userId,
  isBanned,
  role,
  isSelf,
}: {
  userId: string;
  isBanned: boolean;
  role: Role;
  isSelf: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function handleToggleBan() {
    setPending(true);
    const result = await toggleBanAction(userId);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isBanned ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản");
  }

  async function handleRoleChange(next: Role) {
    setPending(true);
    const result = await changeRoleAction(userId, next);
    setPending(false);
    if (result.error) toast.error(result.error);
  }

  if (isSelf) {
    return <span className="text-xs text-muted">Tài khoản của bạn</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={role}
        disabled={pending}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        className="rounded-lg border border-foreground/10 bg-foreground/5 px-2 py-1 text-xs outline-none"
      >
        <option value="USER">USER</option>
        <option value="STUDENT">STUDENT</option>
        <option value="TEACHER">TEACHER</option>
        <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
        <option value="MODERATOR">MODERATOR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <Button
        variant={isBanned ? "primary" : "glass"}
        disabled={pending}
        onClick={handleToggleBan}
        className={isBanned ? "px-3 py-1.5 text-xs" : "px-3 py-1.5 text-xs text-red-500"}
      >
        {isBanned ? "Mở khoá" : "Khoá"}
      </Button>
    </div>
  );
}
