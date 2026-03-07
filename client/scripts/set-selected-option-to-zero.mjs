import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setSelectedOptionToZero() {
  try {
    console.log('Устанавливаем selectedOption в 0 для всех целей...');
    
    // Подсчитываем общее количество целей
    const totalGoals = await prisma.goal.count();
    console.log(`Всего целей в базе данных: ${totalGoals}`);
    
    // Подсчитываем количество целей, у которых selectedOption равен null
    const nullGoalsCount = await prisma.goal.count({
      where: {
        selectedOption: null
      }
    });
    console.log(`Целей с selectedOption = null: ${nullGoalsCount}`);
    
    // Обновляем все цели, у которых selectedOption равен null, устанавливая его в 0
    const updatedGoals = await prisma.goal.updateMany({
      where: {
        selectedOption: null
      },
      data: {
        selectedOption: 0
      }
    });
    
    console.log(`Успешно обновлено ${updatedGoals.count} целей, установив selectedOption в 0`);
    
    // Проверяем, остались ли цели с null значением
    const remainingNullGoals = await prisma.goal.count({
      where: {
        selectedOption: null
      }
    });
    console.log(`Оставшиеся цели с selectedOption = null: ${remainingNullGoals}`);
    
    console.log('Все цели теперь имеют значение selectedOption (0 для ранее отсутствующих)');
    
  } catch (error) {
    console.error('Ошибка при обновлении целей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setSelectedOptionToZero();