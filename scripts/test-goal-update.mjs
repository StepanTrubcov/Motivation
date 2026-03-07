import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGoalUpdate() {
  try {
    console.log('Тестируем обновление цели...');
    
    // Получаем первую цель пользователя для тестирования
    const goal = await prisma.goal.findFirst();
    
    if (!goal) {
      console.log('Цели не найдены');
      return;
    }
    
    console.log('Текущая цель:', goal);
    
    // Попробуем обновить selectedOption для этой цели
    const updatedGoal = await prisma.goal.update({
      where: { id: goal.id },
      data: {
        selectedOption: 30
      }
    });
    
    console.log('Обновленная цель:', updatedGoal);
    
    // Проверим, что значение было обновлено
    const verifiedGoal = await prisma.goal.findUnique({
      where: { id: goal.id }
    });
    
    console.log('Проверенная цель:', verifiedGoal);
    
    if (verifiedGoal.selectedOption === 30) {
      console.log('✅ Успешно: selectedOption обновлен до 30');
    } else {
      console.log('❌ Ошибка: selectedOption не обновлен');
    }
    
  } catch (error) {
    console.error('Ошибка при тестировании обновления цели:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGoalUpdate();