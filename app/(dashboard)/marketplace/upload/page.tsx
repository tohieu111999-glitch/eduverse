import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Building2, CheckCircle2 } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { UploadForm } from "./upload-form";

export default async function UploadDocumentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bankName: true, bankAccount: true, bankAccountName: true },
  });

  const hasBankInfo = Boolean(user?.bankName && user?.bankAccount && user?.bankAccountName);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {hasBankInfo ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Tài khoản nhận tiền: <strong>{user?.bankName}</strong> · {user?.bankAccount} · {user?.bankAccountName}
          </span>
          <Link href="/settings" className="ml-auto shrink-0 text-xs text-primary underline-offset-2 hover:underline">
            Sửa
          </Link>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="font-medium text-amber-500">Chưa có tài khoản nhận tiền</p>
            <p className="mt-0.5 text-amber-600/80 dark:text-amber-400/80">
              Bạn cần thêm tài khoản ngân hàng trước để người mua có thể chuyển khoản cho bạn.
            </p>
          </div>
          <Link
            href="/settings"
            className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
          >
            <Building2 className="h-3.5 w-3.5" />
            Thêm ngay
          </Link>
        </div>
      )}

      <UploadForm />
    </div>
  );
}
