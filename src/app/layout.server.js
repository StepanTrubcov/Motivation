// Серверный компонент для автоматического обновления достижений при запуске приложения

import { updateAllUserAchievements } from '@/lib/updateAchievements';

// Флаг для отслеживания, было ли уже выполнено обновление
let hasRun = false;

export async function initializeApp() {
  // Проверяем, чтобы функция выполнялась только один раз
  if (hasRun) {
    return { success: true, message: 'Инициализация уже была выполнена ранее' };
  }
  
  hasRun = true;
  
  try {
    // Запускаем обновление достижений
    const result = await updateAllUserAchievements();
    console.log('Результат автоматической инициализации:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при автоматической инициализации:', error);
    return { 
      success: false, 
      error: 'Не удалось выполнить автоматическую инициализацию',
      details: error.message 
    };
  }
}