// Скрипт для автоматического обновления достижений при установке/деплое
// Этот скрипт будет запускаться автоматически при postinstall

import { updateAllUserAchievements } from '../src/lib/updateAchievements.cjs';

async function updateAchievements() {
  try {
    console.log('Начинаем автоматическое обновление достижений при postinstall...');
    const result = await updateAllUserAchievements();
    console.log('Результат автоматического обновления:', result);
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при автоматическом обновлении достижений:', error);
    process.exit(1);
  }
}

// Запускаем скрипт
updateAchievements();