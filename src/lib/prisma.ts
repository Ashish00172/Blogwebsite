// Dynamic require to bypass Turbopack edge resolution bugs
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter, log: [] });
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
});
