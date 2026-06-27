import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

export function signRealtimeToken(userId: string) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: "5m" });
}

export function verifyRealtimeToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, SECRET);
    if (typeof payload === "object" && typeof payload.sub === "string") return payload.sub;
    return null;
  } catch {
    return null;
  }
}
