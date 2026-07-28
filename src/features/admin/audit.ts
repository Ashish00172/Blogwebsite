import "server-only";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export type LoginActivityInput = {
  userId?: string;
  userName?: string | null;
  userEmail: string;
  provider: string;
};

async function getRequestMetadata() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  const cfIp = requestHeaders.get("cf-connecting-ip");
  const userAgent = requestHeaders.get("user-agent");

  const candidate = forwardedFor?.split(",")[0]?.trim() || realIp || cfIp;
  return {
    ipAddress: candidate && candidate.length > 0 ? candidate : null,
    userAgent: userAgent && userAgent.length > 0 ? userAgent : null,
  };
}

export async function recordLoginActivity(input: LoginActivityInput) {
  const { ipAddress, userAgent } = await getRequestMetadata();

  await prisma.loginActivity.create({
    data: {
      userId: input.userId ?? null,
      userName: input.userName ?? null,
      userEmail: input.userEmail,
      provider: input.provider,
      ipAddress,
      userAgent,
    },
  });
}

export async function listLoginActivities(limit = 25) {
  return prisma.loginActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          passwordUpdatedAt: true,
        },
      },
    },
  });
}
