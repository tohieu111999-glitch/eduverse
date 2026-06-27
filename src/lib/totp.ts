import { TOTP, Secret } from "otpauth";

export function generateTotpSecret() {
  return new Secret({ size: 20 }).base32;
}

export function buildTotpUri(secret: string, accountLabel: string) {
  const totp = new TOTP({
    issuer: "EduVerse",
    label: accountLabel,
    secret: Secret.fromBase32(secret),
  });
  return totp.toString();
}

export function verifyTotp(secret: string, token: string) {
  const totp = new TOTP({ secret: Secret.fromBase32(secret) });
  return totp.validate({ token, window: 1 }) !== null;
}
