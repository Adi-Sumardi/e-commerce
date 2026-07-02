import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // Override jwt: login Google tidak lewat authorize(), jadi user DB-nya
    // harus dibuat/di-link di sini. Tanpa ini token.id berisi ID Google (sub)
    // yang tidak ada di tabel users -> halaman account/orders menganggap
    // sesi invalid dan me-redirect ke login (terasa seperti auto-logout).
    jwt: async ({ token, user, account }) => {
      if (user) {
        if (account?.provider === "google" && user.email) {
          const dbUser = await db.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
              name: user.name ?? user.email,
              email: user.email,
              role: "CUSTOMER",
            },
          });
          token.id = dbUser.id;
          token.role = dbUser.role;
        } else {
          token.role = (user as { role?: string }).role;
          token.id = user.id;
        }
      }
      return token;
    },
  },
  providers: [
    ...googleProvider,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});
