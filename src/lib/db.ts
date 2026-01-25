// Mock Database Client - No database connection required
// This file now exports a mock Prisma client for testing
// To re-enable database: uncomment the code below and comment out the mock client export

import { mockPrismaClient } from './mock-client';

// Export mock client as default
const prisma = mockPrismaClient as any;

export default prisma;
export { prisma };

/* 
// Original Database Code (commented out)
import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

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

  const sql = neon(connectionString);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon(sql as any);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
*/

