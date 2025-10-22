// Скрипт для проверки наличия всех таблиц в БД
// Запускать: node scripts/check-tables.js

const { PrismaClient } = require('../client/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Проверка таблиц в базе данных...\n');
    
    // Проверяем User
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Таблица User существует (записей: ${userCount})`);
    } catch (e) {
      console.log('❌ Таблица User НЕ существует');
    }
    
    // Проверяем Goal
    try {
      const goalCount = await prisma.goal.count();
      console.log(`✅ Таблица Goal существует (записей: ${goalCount})`);
    } catch (e) {
      console.log('❌ Таблица Goal НЕ существует');
    }
    
    // Проверяем Achievement
    try {
      const achievementCount = await prisma.achievement.count();
      console.log(`✅ Таблица Achievement существует (записей: ${achievementCount})`);
    } catch (e) {
      console.log('❌ Таблица Achievement НЕ существует');
    }
    
    console.log('\n✅ Все таблицы проверены!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
