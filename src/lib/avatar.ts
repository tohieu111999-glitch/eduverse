import { createAvatar } from "@dicebear/core";
import { avataaars, bigSmile, bottts, funEmoji, personas, pixelArt } from "@dicebear/collection";

// Isomorphic (no Buffer/Node APIs) — imported by both the client-side live
// preview and the server action that persists the final choice.
const STYLES = { avataaars, bigSmile, funEmoji, bottts, personas, pixelArt } as const;

export const AVATAR_STYLE_OPTIONS = [
  { value: "avataaars", label: "Người hoạt hình" },
  { value: "bigSmile", label: "Mặt cười lớn" },
  { value: "funEmoji", label: "Emoji vui" },
  { value: "bottts", label: "Robot" },
  { value: "personas", label: "Cá tính" },
  { value: "pixelArt", label: "Pixel Art" },
] as const satisfies { value: keyof typeof STYLES; label: string }[];

export type AvatarStyle = keyof typeof STYLES;

export function isValidAvatarStyle(style: string): style is AvatarStyle {
  return style in STYLES;
}

// Each DiceBear style has a distinct Options type, so a generic STYLES[style]
// lookup doesn't type-check — dispatch through a switch so every call site
// resolves against its own style's concrete type.
export function generateAvatarSvg(style: AvatarStyle, seed: string): string {
  const options = { seed, size: 128 };
  switch (style) {
    case "avataaars":
      return createAvatar(avataaars, options).toString();
    case "bigSmile":
      return createAvatar(bigSmile, options).toString();
    case "funEmoji":
      return createAvatar(funEmoji, options).toString();
    case "bottts":
      return createAvatar(bottts, options).toString();
    case "personas":
      return createAvatar(personas, options).toString();
    case "pixelArt":
      return createAvatar(pixelArt, options).toString();
  }
}
