import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { verifyTotp } from "./totp";

function deriveUsername(seed: string) {
  const base = seed.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "user";
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
}

// Auth.js always reports the generic "CredentialsSignin" on `result.error` —
// the actual reason must be read off `result.code` instead, which only
// reflects custom values when authorize() throws a CredentialsSignin
// subclass (a plain `throw new Error(...)` is normalized away).
class AccountBannedError extends CredentialsSignin {
  code = "ACCOUNT_BANNED";
}
class RequiresTwoFactorError extends CredentialsSignin {
  code = "REQUIRES_2FA";
}
class InvalidTwoFactorError extends CredentialsSignin {
  code = "INVALID_2FA";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // Without this, Auth.js redirects every sign-in back to whatever fixed
  // AUTH_URL/NEXTAUTH_URL is configured (here, "http://localhost:3000"),
  // regardless of which host the request actually came in on — breaking
  // sign-in for anyone visiting via the LAN IP or a real domain. trustHost
  // makes it use the incoming request's actual Host header instead.
  trustHost: true,
  cookies: {
    pkceCodeVerifier: {
      name: "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
        maxAge: 60 * 15,
      },
    },
    state: {
      name: "authjs.state",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
        maxAge: 60 * 15,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email hoặc tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
        totp: { label: "Mã xác thực 2FA", type: "text" },
      },
      authorize: async (credentials) => {
        const rawIdentifier = credentials?.identifier as string | undefined;
        const password = credentials?.password as string | undefined;
        const totp = credentials?.totp as string | undefined;
        if (!rawIdentifier || !password) return null;

        // Registration always lowercases/trims email and username before
        // storing — normalize the same way here, otherwise typing it back
        // with different casing (autocapitalize, copy-paste, etc.) finds no
        // user and falls through to the generic "wrong password" message.
        const identifier = rawIdentifier.trim().toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        if (user.isBanned) throw new AccountBannedError();

        if (user.twoFactorEnabled) {
          if (!totp) throw new RequiresTwoFactorError();
          if (!user.twoFactorSecret || !verifyTotp(user.twoFactorSecret, totp)) throw new InvalidTwoFactorError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          role: user.role,
          level: user.level,
          exp: user.exp,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET, checks: ["state"] })]
      : []),
    ...(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET
      ? [Discord({ clientId: process.env.AUTH_DISCORD_ID, clientSecret: process.env.AUTH_DISCORD_SECRET })]
      : []),
    ...(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET
      ? [Facebook({ clientId: process.env.AUTH_FACEBOOK_ID, clientSecret: process.env.AUTH_FACEBOOK_SECRET })]
      : []),
  ],
  callbacks: {
    async signIn({ user }) {
      // authorize() already blocks banned credentials users with a friendly
      // error; this catches OAuth sign-ins, which never go through authorize().
      if (!user.id) return true;
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { isBanned: true } });
      return !dbUser?.isBanned;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = user.username ?? null;
        token.role = user.role ?? "USER";
        token.level = user.level ?? 1;
        token.userExp = user.exp ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.level = token.level;
      session.user.exp = token.userExp;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const username = user.username ?? deriveUsername(user.email ?? user.name ?? user.id);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          username,
          displayName: user.displayName ?? user.name ?? username,
          avatar: user.avatar ?? user.image ?? null,
        },
      });
    },
  },
});
