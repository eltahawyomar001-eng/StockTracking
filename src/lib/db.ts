import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // During build time without DATABASE_URL, return a proxy
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set - database operations will fail');
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === 'then') return undefined;
        return () => {
          throw new Error('DATABASE_URL environment variable is not set.');
        };
      },
    });
  }

  // Prisma 7 uses prisma.config.ts for datasource configuration
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
