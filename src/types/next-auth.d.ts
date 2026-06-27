import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    username?: string | null;
    displayName?: string | null;
    avatar?: string | null;
    role?: string;
    level?: number;
    exp?: number;
  }

  interface Session {
    user: {
      id: string;
      username: string | null;
      role: string;
      level: number;
      exp: number;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    username?: string | null;
    displayName?: string | null;
    avatar?: string | null;
    role?: string;
    level?: number;
    exp?: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    username: string | null;
    role: string;
    level: number;
    // Gamification experience points. Named `userExp` (not `exp`) because the
    // JWT spec already reserves `exp` for the token's own expiration claim.
    userExp: number;
  }
}
