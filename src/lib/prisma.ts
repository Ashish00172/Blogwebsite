// Dynamic require to bypass Turbopack edge resolution bugs
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

type PrismaClientLike = any;

const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new (...args: unknown[]) => PrismaClientLike;
};

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClientLike;
};

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

function createPrismaClient(): PrismaClientLike {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter, log: [] });
}

export function getPrismaClient(): PrismaClientLike {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClientLike, {
  get(_target, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
});
