"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { OAuthButtons } from "@/src/components/auth/oauth-buttons";
import { Button } from "@/src/components/ui/button";

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export function LoginForm({ oauth }: { oauth: { google: boolean; discord: boolean; facebook: boolean } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingCreds, setPendingCreds] = useState<{ identifier: string; password: string } | null>(null);

  async function attemptSignIn(identifier: string, password: string, totp?: string) {
    setError(null);
    setPending(true);

    const result = await signIn("credentials", { identifier, password, totp: totp ?? "", redirect: false });

    setPending(false);

    if (result?.code === "REQUIRES_2FA") {
      setPendingCreds({ identifier, password });
      return;
    }
    if (result?.code === "INVALID_2FA") {
      setPendingCreds({ identifier, password });
      setError("Mã xác thực không đúng");
      return;
    }
    if (result?.error) {
      setError(result.code === "ACCOUNT_BANNED" ? "Tài khoản của bạn đã bị khóa" : "Email hoặc mật khẩu không đúng");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await attemptSignIn(String(formData.get("identifier")), String(formData.get("password")));
  }

  async function handleTotpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingCreds) return;
    const formData = new FormData(e.currentTarget);
    await attemptSignIn(pendingCreds.identifier, pendingCreds.password, String(formData.get("totp")));
  }

  if (pendingCreds) {
    return (
      <div className="mt-6 space-y-5">
        <form onSubmit={handleTotpSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Mã xác thực 2FA</label>
            <input name="totp" maxLength={6} className={inputClass} placeholder="123456" autoFocus required />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Đang xác thực..." : "Xác nhận"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setPendingCreds(null);
              setError(null);
            }}
            className="w-full text-center text-xs text-muted hover:underline"
          >
            Quay lại
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email hoặc tên đăng nhập</label>
          <input name="identifier" className={inputClass} placeholder="ban@email.com" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input name="password" type="password" className={inputClass} placeholder="••••••••" required />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <OAuthButtons oauth={oauth} />
    </div>
  );
}
