import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// ============================================
// Prisma Client with Cloudflare Edge Support
// ============================================
// In production (Cloudflare Workers), we use the Neon serverless
// HTTP driver via the Prisma adapter for edge compatibility.
// In local development, we use the standard Prisma client
// for better DX with query logging.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Use Neon serverless adapter for Cloudflare edge compatibility
  // This works in both edge (Cloudflare Workers) and Node.js environments
  try {
    const adapter = new PrismaNeon({ connectionString: databaseUrl });

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : [],
    });
  } catch {
    // Fallback to standard Prisma client if adapter fails
    // (e.g., during prisma generate or CLI commands)
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : [],
    });
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
