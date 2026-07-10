"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { generateTotpSecret, buildTotpUri, verifyTotp } from "@/src/lib/totp";
import { generateQrDataUrl } from "@/src/lib/qrcode";
import { saveAvatarFile, extOf } from "@/src/lib/storage";
import { generateAvatarSvg, isValidAvatarStyle } from "@/src/lib/avatar";

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type AvatarState = { error?: string; success?: boolean };

export async function uploadAvatarAction(_prevState: AvatarState, formData: FormData): Promise<AvatarState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Vui lòng chọn ảnh" };
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) return { error: "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP" };
  if (file.size > MAX_AVATAR_BYTES) return { error: "Ảnh tối đa 4MB" };

  const url = await saveAvatarFile(file, extOf(file.name) || ".jpg");
  await prisma.user.update({ where: { id: session.user.id }, data: { avatar: url } });

  revalidatePath("/settings");
  return { success: true };
}

export async function setGeneratedAvatarAction(_prevState: AvatarState, formData: FormData): Promise<AvatarState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const style = String(formData.get("style") ?? "");
  const seed = String(formData.get("seed") ?? "").slice(0, 100);
  if (!isValidAvatarStyle(style) || !seed) return { error: "Lựa chọn avatar không hợp lệ" };

  const svg = generateAvatarSvg(style, seed);
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  await prisma.user.update({ where: { id: session.user.id }, data: { avatar: dataUri } });

  revalidatePath("/settings");
  return { success: true };
}

export async function startTwoFactorSetupAction(): Promise<{ error?: string; qrDataUrl?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, email: true, twoFactorEnabled: true },
  });
  if (!user) return { error: "Không tìm thấy người dùng" };
  if (user.twoFactorEnabled) return { error: "2FA đã được bật" };

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorSecret: secret } });

  const uri = buildTotpUri(secret, user.username ?? user.email ?? "user");
  const qrDataUrl = await generateQrDataUrl(uri);

  return { qrDataUrl };
}

export type ConfirmTwoFactorState = { error?: string; success?: boolean };

export async function confirmTwoFactorAction(
  _prevState: ConfirmTwoFactorState,
  formData: FormData,
): Promise<ConfirmTwoFactorState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const code = String(formData.get("code") ?? "").trim();
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { twoFactorSecret: true } });
  if (!user?.twoFactorSecret) return { error: "Vui lòng bắt đầu thiết lập trước" };
  if (!verifyTotp(user.twoFactorSecret, code)) return { error: "Mã xác thực không đúng" };

  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: true } });
  return { success: true };
}

export type DisableTwoFactorState = { error?: string; success?: boolean };

export async function disableTwoFactorAction(
  _prevState: DisableTwoFactorState,
  formData: FormData,
): Promise<DisableTwoFactorState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
  if (!user?.password) return { error: "Tài khoản này không dùng mật khẩu" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Mật khẩu không đúng" };

  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  return { success: true };
}

export type BankState = { error?: string; success?: boolean };

export async function saveBankAccountAction(
  _prevState: BankState | null,
  formData: FormData,
): Promise<BankState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const bankName = String(formData.get("bankName") ?? "").trim();
  const bankBin = String(formData.get("bankBin") ?? "").trim();
  const bankAccount = String(formData.get("bankAccount") ?? "").trim().replace(/\s/g, "");
  const bankAccountName = String(formData.get("bankAccountName") ?? "").trim().toUpperCase();

  if (!bankName || !bankBin || !bankAccount || !bankAccountName) {
    return { error: "Vui lòng điền đầy đủ thông tin ngân hàng" };
  }
  if (!/^\d{6,10}$/.test(bankBin)) return { error: "Mã ngân hàng (BIN) không hợp lệ" };
  if (!/^\d{6,19}$/.test(bankAccount)) return { error: "Số tài khoản không hợp lệ" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bankName, bankBin, bankAccount, bankAccountName },
  });

  revalidatePath("/settings");
  return { success: true };
}
