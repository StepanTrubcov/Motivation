import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const weeklyReport = async () => {
  try {
    console.log('Начинаем формирование еженедельного отчета...');
    console.log('Запуск еженедельного отчета (тестирование)');
    
    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    console.log(`Найдено пользователей: ${users.length}`);
    
    // Обрабатываем каждого пользователя
    for (const user of users) {
      try {
        // Здесь вы можете добавить логику для обновления savingGoals
        // Например, получение текущих целей из внешнего API или вычисление на основе других данных
        
        // Пример структуры данных для savingGoals:
        // [{
        //   id: "goal1",
        //   name: "Накопить на телефон",
        //   status: "active"
        // }]
        
        // Если вам нужно обновить savingGoals для пользователя:
        // const updatedUser = await prisma.user.update({
        //   where: { id: user.id },
        //   data: {
        //     savingGoals: {
        //       // Новые данные целей
        //     }
        //   }
        // });
        
        console.log(`Обработан пользователь: ${user.telegramId}`);
      } catch (userError) {
        console.error(`Ошибка при обработке пользователя ${user.telegramId}:`, userError);
      }
    }
    
    return { success: true, message: 'Еженедельный отчет сформирован', usersProcessed: users.length };
  } catch (error) {
    console.error('Ошибка при формировании еженедельного отчета:', error);
    return { success: false, error: error.message };
  }
  // Note: Не закрываем соединение с базой данных здесь, чтобы планировщик мог работать повторно
};

// Функция для добавления или обновления цели пользователя
const updateUserSavingGoal = async (userId, goalData) => {
  try {
    // Получаем текущего пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Получаем текущие цели
    let savingGoals = user.savingGoals || [];
    
    // Проверяем, существует ли уже цель с таким ID
    const existingGoalIndex = savingGoals.findIndex(goal => goal.id === goalData.id);
    
    if (existingGoalIndex >= 0) {
      // Обновляем существующую цель
      savingGoals[existingGoalIndex] = { ...savingGoals[existingGoalIndex], ...goalData };
    } else {
      // Добавляем новую цель
      savingGoals.push(goalData);
    }
    
    // Обновляем пользователя с новыми целями
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { savingGoals: savingGoals }
    });
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Ошибка при обновлении цели пользователя:', error);
    return { success: false, error: error.message };
  }
};

// Функция для удаления цели пользователя
const removeUserSavingGoal = async (userId, goalId) => {
  try {
    // Получаем текущего пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Фильтруем цели, исключая удаляемую
    const savingGoals = (user.savingGoals || []).filter(goal => goal.id !== goalId);
    
    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { savingGoals: savingGoals }
    });
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Ошибка при удалении цели пользователя:', error);
    return { success: false, error: error.message };
  }
};

// Функция для получения целей пользователя
const getUserSavingGoals = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingGoals: true }
    });
    
    return { success: true, savingGoals: user?.savingGoals || [] };
  } catch (error) {
    console.error('Ошибка при получении целей пользователя:', error);
    return { success: false, error: error.message };
  }
};

export {
  weeklyReport,
  updateUserSavingGoal,
  removeUserSavingGoal,
  getUserSavingGoals
};