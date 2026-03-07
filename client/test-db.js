
import { prisma } from './src/lib/prisma/prismaPostgresClient';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ Database connection successful!');
    console.log(`Found ${users.length} users`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

