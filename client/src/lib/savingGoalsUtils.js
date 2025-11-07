import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Добавить новую цель в массив savingGoals пользователя
 * @param {string} userId - ID пользователя
 * @param {Object} goalData - Данные цели (объект с id, name, status и другими полями)
 * @returns {Object} Результат операции
 */
export const addUserSavingGoal = async (userId, goalData) => {
  try {
    // Преобразуем объект цели в строку JSON для хранения в String[] массиве
    const goalString = JSON.stringify(goalData);
    
    // Добавляем новую цель в массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        savingGoals: {
          push: goalString
        }
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Ошибка при добавлении цели пользователя:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Обновить все цели пользователя (полная замена массива)
 * @param {string} userId - ID пользователя
 * @param {Array} goalsArray - Массив объектов целей
 * @returns {Object} Результат операции
 */
export const updateUserSavingGoals = async (userId, goalsArray) => {
  try {
    // Преобразуем массив объектов в массив строк JSON
    const goalsStrings = goalsArray.map(goal => JSON.stringify(goal));
    
    // Обновляем весь массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        savingGoals: goalsStrings
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Ошибка при обновлении целей пользователя:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Получить цели пользователя в виде объектов
 * @param {string} userId - ID пользователя
 * @returns {Object} Результат операции с массивом целей
 */
export const getUserSavingGoals = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Преобразуем строки JSON обратно в объекты
    const goalsObjects = user.savingGoals.map(goalString => {
      try {
        return JSON.parse(goalString);
      } catch (parseError) {
        console.error('Ошибка парсинга цели:', goalString, parseError);
        return {}; // Возвращаем пустой объект в случае ошибки парсинга
      }
    });
    
    return { success: true, savingGoals: goalsObjects };
  } catch (error) {
    console.error('Ошибка при получении целей пользователя:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Удалить цель пользователя по индексу
 * @param {string} userId - ID пользователя
 * @param {number} index - Индекс цели для удаления
 * @returns {Object} Результат операции
 */
export const removeUserSavingGoalByIndex = async (userId, index) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Создаем новый массив без элемента по указанному индексу
    const newGoals = user.savingGoals.filter((_, i) => i !== index);
    
    // Обновляем массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        savingGoals: newGoals
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Ошибка при удалении цели пользователя:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Найти и обновить конкретную цель пользователя по ID
 * @param {string} userId - ID пользователя
 * @param {string} goalId - ID цели
 * @param {Object} updatedGoalData - Обновленные данные цели
 * @returns {Object} Результат операции
 */
export const updateUserSavingGoalById = async (userId, goalId, updatedGoalData) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Преобразуем строки JSON в объекты и находим цель по ID
    let goalsObjects = user.savingGoals.map(goalString => {
      try {
        return JSON.parse(goalString);
      } catch (parseError) {
        console.error('Ошибка парсинга цели:', goalString, parseError);
        return {}; // Возвращаем пустой объект в случае ошибки парсинга
      }
    });
    
    // Находим индекс цели по ID
    const goalIndex = goalsObjects.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Цель не найдена');
    }
    
    // Обновляем цель
    goalsObjects[goalIndex] = { ...goalsObjects[goalIndex], ...updatedGoalData };
    
    // Преобразуем обратно в строки JSON
    const goalsStrings = goalsObjects.map(goal => JSON.stringify(goal));
    
    // Обновляем массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        savingGoals: goalsStrings
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Ошибка при обновлении цели пользователя по ID:', error);
    return { success: false, error: error.message };
  }
};

export default {
  addUserSavingGoal,
  updateUserSavingGoals,
  getUserSavingGoals,
  removeUserSavingGoalByIndex,
  updateUserSavingGoalById
};