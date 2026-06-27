"use client";

import { useState } from "react";
import { useActionState } from "react";
import { registerAction, type RegisterState } from "./actions";
import { OAuthButtons } from "@/src/components/auth/oauth-buttons";
import { Button } from "@/src/components/ui/button";

const initialState: RegisterState = {};

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

const ROLE_OPTIONS = [
  { value: "USER", label: "Tài khoản tự do" },
  { value: "STUDENT", label: "Học sinh / Sinh viên" },
  { value: "TEACHER", label: "Giáo viên" },
  { value: "SCHOOL_ADMIN", label: "Quản trị Trường / Tổ chức" },
];

export function RegisterForm({ oauth }: { oauth: { google: boolean; discord: boolean; facebook: boolean } }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [role, setRole] = useState("USER");

  return (
    <div className="mt-6 space-y-5">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tên hiển thị</label>
          <input name="displayName" className={inputClass} placeholder="Nguyễn Văn A" required />
          {state.fieldErrors?.displayName && (
            <p className="mt-1 text-xs text-red-500">{state.fieldErrors.displayName}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Tên đăng nhập</label>
          <input name="username" className={inputClass} placeholder="nguyenvana" required />
          {state.fieldErrors?.username && <p className="mt-1 text-xs text-red-500">{state.fieldErrors.username}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input name="email" type="email" className={inputClass} placeholder="ban@email.com" required />
          {state.fieldErrors?.email && <p className="mt-1 text-xs text-red-500">{state.fieldErrors.email}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input name="password" type="password" className={inputClass} placeholder="••••••••" required />
          {state.fieldErrors?.password && <p className="mt-1 text-xs text-red-500">{state.fieldErrors.password}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Loại tài khoản</label>
          <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {role === "SCHOOL_ADMIN" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Tên trường / tổ chức</label>
            <input name="schoolName" className={inputClass} placeholder="Trường THPT ABC" required />
            {state.fieldErrors?.schoolName && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.schoolName}</p>
            )}
          </div>
        )}

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang tạo tài khoản..." : "Đăng ký"}
        </Button>
      </form>

      <OAuthButtons oauth={oauth} />
    </div>
  );
}
