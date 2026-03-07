import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserSavingGoals() {
  try {
    console.log('Обновляем savingGoals для всех пользователей...');
    
    // Получаем всех пользователей
    const users = await prisma.user.findMany();
    console.log(`Найдено пользователей: ${users.length}`);
    
    let updatedUsersCount = 0;
    
    for (const user of users) {
      if (user.savingGoals && Array.isArray(user.savingGoals) && user.savingGoals.length > 0) {
        // Проверяем, нужно ли обновить структуру savingGoals
        let needsUpdate = false;
        const updatedSavingGoals = user.savingGoals.map(goal => {
          // Проверяем, есть ли у цели goalData и является ли оно массивом
          if (goal && typeof goal === 'object' && !Array.isArray(goal.goalData)) {
            needsUpdate = true;
            // Если goalData не является массивом, пытаемся его преобразовать
            let goalData = [];
            if (goal.goalData) {
              if (Array.isArray(goal.goalData)) {
                goalData = goal.goalData;
              } else if (typeof goal.goalData === 'string') {
                try {
                  goalData = JSON.parse(goal.goalData);
                } catch (e) {
                  console.warn(`Не удалось разобрать goalData для пользователя ${user.id}:`, e);
                  goalData = [];
                }
              }
            }
            
            return {
              ...goal,
              goalData: Array.isArray(goalData) ? goalData : []
            };
          }
          return goal;
        });
        
        if (needsUpdate) {
          // Обновляем пользователя с новой структурой savingGoals
          await prisma.user.update({
            where: { id: user.id },
            data: {
              savingGoals: updatedSavingGoals
            }
          });
          updatedUsersCount++;
          console.log(`Обновлен пользователь ${user.id}`);
        }
      }
    }
    
    console.log(`Успешно обновлено пользователей: ${updatedUsersCount}`);
    console.log('Все savingGoals теперь имеют правильную структуру');
    
  } catch (error) {
    console.error('Ошибка при обновлении savingGoals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserSavingGoals();