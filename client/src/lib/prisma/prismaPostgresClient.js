import { PrismaClient } from '@prisma/client';
import { prismaConnectionUrl } from '@/lib/prismaConnectionOptions.mjs';
const url = prismaConnectionUrl(process.env.DIRECT_DATABASE_URL, Number(process.env.APP_DB_CONNECTION_LIMIT || 3));
// One pool per Node process, including production route bundles and development refreshes.
export const prisma = globalThis.prisma || new PrismaClient({
  ...(url ? { datasourceUrl: url } : {}),
  transactionOptions: { maxWait: 10000, timeout: 20000 },
});
globalThis.prisma = prisma;
export const prismaPostgres = prisma;
