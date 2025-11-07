// Скрипт для удаления всех достижений у всех пользователей
// Запуск: node clear-all-achievements.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllAchievements() {
  try {
    console.log('Начинаем удаление всех достижений для всех пользователей...');
    
    // Удаляем все достижения для всех пользователей
    const result = await prisma.achievement.deleteMany({});
    
    console.log(`Успешно удалено ${result.count} достижений`);
  } catch (error) {
    console.error('Ошибка при удалении всех достижений:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
clearAllAchievements();