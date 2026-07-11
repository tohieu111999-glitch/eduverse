import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "EduVerse <noreply@resend.dev>";

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "https://eduverse-psi-nine.vercel.app";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Đặt lại mật khẩu EduVerse",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0e1016;color:#e2e8f8;border-radius:16px">
        <h1 style="font-size:22px;font-weight:800;margin:0 0 8px">Đặt lại mật khẩu</h1>
        <p style="color:#8896bb;margin:0 0 24px;font-size:14px">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong style="color:#e2e8f8">${email}</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#e85d04;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:24px">
          Đặt lại mật khẩu
        </a>
        <p style="color:#5a6280;font-size:12px;margin:0">Link có hiệu lực trong <strong>1 giờ</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      </div>
    `,
  });
}
