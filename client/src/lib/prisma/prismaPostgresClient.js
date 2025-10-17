import { PrismaClient } from '.prisma/postgres-client';

const globalForPrismaPostgres = global;

export const prismaPostgres = globalForPrismaPostgres.prismaPostgres || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaPostgres.prismaPostgres = prismaPostgres;
}
