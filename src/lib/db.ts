import { PrismaClient } from '@/generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  // During build time without DATABASE_URL, return a proxy
  if (!connectionString) {
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

  // Use Neon serverless Pool adapter
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
