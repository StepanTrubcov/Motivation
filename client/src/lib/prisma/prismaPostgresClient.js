import { PrismaClient } from '.prisma/postgres-client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrismaPostgres = global;

export const prismaPostgres = globalForPrismaPostgres.prismaPostgres || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaPostgres.prismaPostgres = prismaPostgres;
}
