import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrismaClient } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { recordLoginActivity } from "@/features/admin/audit";
import { authSecret } from "@/auth/secret";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(getPrismaClient()),
  session: { strategy: "jwt" },
  secret: authSecret,
  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" }),
    GitHub({ clientId: process.env.GITHUB_CLIENT_ID ?? "", clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "" }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const user = await getPrismaClient().user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authedUser = user as { id?: string; role?: string };
        token.sub = authedUser.id ?? token.sub;
        token.role = authedUser.role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & { id?: string; role?: string };
        const authToken = token as { role?: string; sub?: string };
        sessionUser.id = authToken.sub ?? sessionUser.id;
        sessionUser.role = authToken.role ?? "USER";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      try {
        const email = user.email?.trim();
        if (!email) {
          return;
        }

        await recordLoginActivity({
          userId: user.id,
          userName: user.name,
          userEmail: email,
          provider: account?.provider ?? "credentials",
        });
      } catch {
        // Never block a login because audit logging failed.
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};
