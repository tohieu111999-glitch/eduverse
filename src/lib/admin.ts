import { auth } from "@/src/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return null;
  return session;
}
