import type { NextAuthConfig } from "next-auth";

// Config edge-safe (dipakai oleh proxy.ts/middleware): TIDAK boleh mengimpor
// Prisma Client atau bcryptjs di sini — keduanya Node-only dan akan gagal di Edge runtime.
// Provider (Credentials/Google) ditambahkan di src/lib/auth.ts untuk Node runtime.
export const authConfig = {
  // Di belakang reverse proxy Hostinger, host asli datang dari header X-Forwarded-Host.
  // Tanpa ini NextAuth menolak semua request dengan error UntrustedHost (HTTP 503).
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
        (session.user as { id?: string }).id = token.id as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
