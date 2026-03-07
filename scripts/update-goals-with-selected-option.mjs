import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateGoalsWithSelectedOption() {
  try {
    console.log('Проверяем, есть ли у целей поле selectedOption...');
    
    // Получаем информацию о первой цели, чтобы проверить наличие поля
    const firstGoal = await prisma.goal.findFirst();
    
    if (firstGoal && typeof firstGoal.selectedOption === 'undefined') {
      console.log('Поле selectedOption отсутствует в схеме. Пожалуйста, сначала примените миграцию.');
      return;
    }
    
    console.log('Поле selectedOption присутствует в схеме. Обновляем все цели...');
    
    // Подсчитываем количество целей, которые нужно обновить
    const goalsCount = await prisma.goal.count({
      where: {
        selectedOption: null
      }
    });
    
    console.log(`Найдено ${goalsCount} целей для обновления`);
    
    if (goalsCount > 0) {
      // Обновляем все цели, у которых еще нет значения selectedOption
      const updatedGoals = await prisma.goal.updateMany({
        where: {
          selectedOption: null
        },
        data: {
          selectedOption: null
        }
      });
      
      console.log(`Успешно обновлено ${updatedGoals.count} целей`);
    } else {
      console.log('Нет целей, требующих обновления');
    }
    
    console.log('Все цели теперь имеют поле selectedOption со значением null');
    
  } catch (error) {
    console.error('Ошибка при обновлении целей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateGoalsWithSelectedOption();