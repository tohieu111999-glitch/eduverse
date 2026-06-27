import QRCode from "qrcode";

// Rendered locally rather than via a third-party QR API — the encoded URI
// contains the user's TOTP secret, which must never leave our server.
export function generateQrDataUrl(text: string) {
  return QRCode.toDataURL(text, { width: 240, margin: 1 });
}
