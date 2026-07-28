import "server-only";

import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/auth/config";

export type AuthUser = NonNullable<Session["user"]> & {
  id: string;
  role?: string;
};

export type AuthSession = Omit<Session, "user"> & {
  user: AuthUser;
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  return {
    ...(session as AuthSession),
  };
}
