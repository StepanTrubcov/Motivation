// Скрипт для проверки структуры целей в БД
// Запускать: node scripts/check-goals-schema.js

const { PrismaClient } = require('../client/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function checkGoalsSchema() {
  try {
    console.log('🔍 Проверка структуры целей в базе данных...\n');
    
    const goals = await prisma.goal.findMany({
      take: 3 // Возьмем первые 3 цели для примера
    });
    
    if (goals.length === 0) {
      console.log('⚠️  В базе данных нет целей');
    } else {
      console.log(`✅ Найдено целей: ${goals.length}\n`);
      goals.forEach((goal, index) => {
        console.log(`--- Цель ${index + 1} ---`);
        console.log(`ID: ${goal.id}`);
        console.log(`Название: ${goal.title}`);
        console.log(`Категория: ${goal.category || 'НЕ УКАЗАНА'}`);
        console.log(`Статус: ${goal.status}`);
        console.log(`Очки: ${goal.points}`);
        console.log(`Прогресс: ${goal.progress}`);
        console.log('');
      });
    }
    
    // Проверим количество целей по категориям
    const categories = ['Sport', 'Discipline', 'Self_development', 'Spirituality'];
    console.log('📊 Распределение по категориям:');
    for (const category of categories) {
      const count = await prisma.goal.count({
        where: { category }
      });
      console.log(`  ${category}: ${count} целей`);
    }
    
    const withoutCategory = await prisma.goal.count({
      where: { category: null }
    });
    console.log(`  Без категории: ${withoutCategory} целей`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGoalsSchema();
