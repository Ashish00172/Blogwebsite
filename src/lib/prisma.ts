// Dynamic require to bypass Turbopack edge resolution bugs
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

type PrismaClientLike = any;

const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new (...args: unknown[]) => PrismaClientLike;
};

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClientLike;
};

const localDatabaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const bundledDatabasePath = join(process.cwd(), "dev.db");
const runtimeDatabasePath = "/tmp/ai-seo-blogger/dev.db";
const runtimeDatabaseUrl = `file:${runtimeDatabasePath}`;

function ensureRuntimeDatabaseFile() {
  const runtimeDirectory = dirname(runtimeDatabasePath);
  if (!existsSync(runtimeDatabasePath)) {
    mkdirSync(runtimeDirectory, { recursive: true });
    if (existsSync(bundledDatabasePath)) {
      copyFileSync(bundledDatabasePath, runtimeDatabasePath);
    }
  }
}

function resolveDatabaseUrl() {
  if (!localDatabaseUrl.startsWith("file:")) {
    return localDatabaseUrl;
  }

  const isVercelRuntime = process.env.VERCEL === "1" && process.env.NEXT_PHASE !== "phase-production-build";

  if (isVercelRuntime) {
    ensureRuntimeDatabaseFile();
    return runtimeDatabaseUrl;
  }

  return localDatabaseUrl;
}

function createPrismaClient(): PrismaClientLike {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
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
