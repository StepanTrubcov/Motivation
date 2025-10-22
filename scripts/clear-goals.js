const { PrismaClient } = require('../client/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function clearGoals() {
  try {
    console.log('🗑️  Удаление всех целей из базы данных...');
    
    const result = await prisma.goal.deleteMany({});
    
    console.log(`✅ Удалено ${result.count} целей`);
    console.log('✅ База данных очищена! Теперь можно заново инициализировать цели.');
  } catch (error) {
    console.error('❌ Ошибка при удалении целей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearGoals();
