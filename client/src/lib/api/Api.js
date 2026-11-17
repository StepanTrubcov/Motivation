import { TEMPLATE_GOALS_ARRAY } from '@/lib/goalCatalog.mjs';
import axios from './http';
import { decorateAchievementArtwork } from '@/lib/achievementImages';
import { ACHIEVEMENT_TEMPLATES } from '@/lib/achievementTemplates.mjs';


let WebApp;
let isWebAppLoading = true;

if (typeof window !== 'undefined') {
  import('@twa-dev/sdk').then(module => {
    WebApp = module.default;
    isWebAppLoading = false;
  }).catch(() => { isWebAppLoading = false; });
}

const BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : '/api';

export const addProfileApi = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Откройте приложение через Telegram или попробуйте ещё раз');
  }

  let waitAttempts = 0;
  while (isWebAppLoading && waitAttempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    waitAttempts++;
  }

  if (!WebApp) {
    console.error('WebApp SDK failed to load');
    throw new Error('Откройте приложение через Telegram или попробуйте ещё раз');
  }

  WebApp.ready();

  const userData = WebApp.initDataUnsafe?.user || (process.env.NODE_ENV === 'development' ? {
    id: 123,
    first_name: 'testBot',
    username: 'username',
    photo_url: null,
  } : null);

  if (!userData) {
    console.error("Нет данных пользователя от Telegram");
    throw new Error('Откройте приложение через Telegram или попробуйте ещё раз');
  }

  const symbols1 = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ];

  const symbols2 = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ];

  const usersTag = await '#' + symbols1[Math.round(0 - 0.5 + Math.random() * (symbols1.length - 0 + 1))] + symbols2[Math.round(0 - 0.5 + Math.random() * (symbols2.length - 0 + 1))] + " " + '#дд'

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const postResponse = await axios.post(`${BASE_URL}/users`, {
        telegramId: userData.id,
        firstName: userData.first_name,
        username: userData.username,
        photoUrl: userData.photo_url,
        usersTag: usersTag
      });

      return postResponse.data;
    } catch (error) {
      attempts++;
      console.error(`Попытка ${attempts} не удалась:`, {
        message: error.message,
        response: error.response ? error.response.data : null,
        status: error.response ? error.response.status : null
      });

      if (attempts >= maxAttempts) {
        console.error("Все попытки создания профиля провалились");
        throw error;
      }
    }
  }
};

// Что "прокидывать" при вызове:
// 1) `telegramId` (строка/число) - идентификатор пользователя в Telegram, по нему делаем update.
// 2) `language` (строка) - одно из: `rus`/`ang` (значения БД) или `ru`/`en` (значения UI);
//    функция сама замапит на `rus`/`ang`.
export const updateUserLanguage = async (telegramId, language) => {
  const baseTelegramId = telegramId != null ? String(telegramId) : null;
  if (!baseTelegramId) throw new Error('telegramId is required');
  if (!language) throw new Error('language is required');

  const normalized = String(language).toLowerCase();
  const dbLanguage =
    normalized === 'ru' || normalized === 'rus' ? 'rus'
      : normalized === 'en' || normalized === 'ang' ? 'ang'
        : null;

  if (!dbLanguage) throw new Error("language must be one of: 'rus'/'ang' or 'ru'/'en'");

  const response = await axios.put(`${BASE_URL}/users`, {
    telegramId: baseTelegramId,
    language: dbLanguage,
  });

  return response.data;
};

export const getUserLanguageByTelegramId = async (telegramId) => {
  const baseTelegramId = telegramId != null ? String(telegramId) : null;
  if (!baseTelegramId) throw new Error('telegramId is required');

  const response = await axios.get(`${BASE_URL}/users/language`, {
    params: { telegramId: baseTelegramId },
  });

  return response.data;
};

export async function saveGoalLifecycle(userId, input) {
  for (let attempt = 0; ; attempt++) {
    try {
      return (await axios.post(`${BASE_URL}/goals/${userId}/lifecycle`, input, { timeout: 20000 })).data;
    } catch (error) {
      if (attempt === 0 && (!error.response || error.response.status >= 500)) continue;
      throw error;
    }
  }
}

export async function saveGoalCompletion(userId, goalId, action, requestId, date) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await axios.post(`${BASE_URL}/goals/${userId}/${goalId}/completion`, { action, requestId, date }, { timeout: 15000 });
      return response.data;
    } catch (error) {
      if (attempt === 0 && (!error.response || error.response.status >= 500)) continue;
      throw error;
    }
  }
}

export async function getAllGoals(customUserId) {
  if (!customUserId) {
    console.error("customUserId is undefined");
    throw new Error("customUserId is required");
  }
  try {
    const response = await axios.get(`${BASE_URL}/goals/${customUserId}`);
    if (!Array.isArray(response.data)) throw new Error("Некорректный ответ при загрузке целей");
    return response.data;
  } catch (error) {
    console.error("Ошибка получения целей:", error);
    throw error;
  }
}

export async function addPoints(customUserId, points) {
  try {
    const response = await axios.post(`${BASE_URL}/users/${customUserId}/pts/increment`, {
      amount: points
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка добавления очков:", error);
    throw error;
  }
}

export async function removePoints(customUserId, points) {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${customUserId}/pts/increment`, {
      data: { amount: points }
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка уменьшения очков:", error);
    throw error;
  }
}

export async function getAllStatus(customUserId, goalId, newStatus, selectedOption = null, timeSettings = {}) {
  if (!customUserId || !goalId || !newStatus) {
    console.error(`Invalid parameters: customUserId=${customUserId}, goalId=${goalId}, newStatus=${newStatus}`);
    throw new Error("customUserId, goalId, and newStatus are required");
  }

  try {
    // Передаем selectedOption в API endpoint
    const requestData = { newStatus };
    // Передаем selectedOption, даже если он равен 0
    if (selectedOption !== null && selectedOption !== undefined) {
      requestData.selectedOption = selectedOption;
    }
    if (timeSettings.durationMinutes !== null && timeSettings.durationMinutes !== undefined) {
      requestData.durationMinutes = timeSettings.durationMinutes;
    }
    if (Number.isInteger(timeSettings.quantity)) requestData.quantity = timeSettings.quantity;
    if (timeSettings.targetTime) requestData.targetTime = timeSettings.targetTime;

    const response = await axios.put(`${BASE_URL}/goals/${customUserId}/${goalId}`, requestData);
    return response.data;

  } catch (error) {
    console.error(`Ошибка обновления статуса цели ${goalId}:`, error);
    throw error;
  }
}

export async function checkGoalCompletion(customUserId) {
  if (!customUserId) {
    console.error("customUserId is undefined in checkGoalCompletion");
    throw new Error("customUserId is required");
  }
  try {
    const response = await axios.post(`${BASE_URL}/check-completion/${customUserId}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка проверки завершения целей:", error);
    throw error;
  }
}

export { TEMPLATE_GOALS_ARRAY } from '@/lib/goalCatalog.mjs';

export async function initializeUserGoals(customUserId) {
  if (!customUserId) {
    console.error("customUserId is undefined in initializeUserGoals");
    throw new Error("customUserId is required");
  }

  const goalsArray = TEMPLATE_GOALS_ARRAY;


  try {
    const existingGoals = await getAllGoals(customUserId);

    // Проверяем, есть ли уже цели у пользователя


    const response = await axios.post(`${BASE_URL}/initialize-goals/${customUserId}`, {
      goalsArray
    });

    return true;
  } catch (error) {
    console.error("❌ Ошибка инициализации целей:", error);
    throw error;
  }
}

export async function syncUserGoals(customUserId) {
  if (!customUserId) throw new Error("customUserId is required");
  const goalsArray = TEMPLATE_GOALS_ARRAY;
  const res = await axios.post(`${BASE_URL}/sync-goals/${customUserId}`, { goalsArray });
  return res.data;
}

export async function addCompletedDate(customUserId, date) {
  if (!customUserId || !date) {
    throw new Error("customUserId и date обязательны");
  }

  try {
    const response = await axios.post(`${BASE_URL}/users/${customUserId}/completed-dates`, { date });
    return response.data;
  } catch (error) {
    console.error("Ошибка добавления даты:", error);
    throw error;
  }
}

export async function deleteCompletedDate(customUserId, date) {
  if (!customUserId || !date) {
    throw new Error("customUserId и date обязательны");
  }

  try {
    const response = await axios.delete(`${BASE_URL}/users/${customUserId}/completed-dates`, {
      data: { date }
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка удаления даты:", error);
    throw error;
  }
}

export async function getCompletedDates(customUserId) {
  if (!customUserId) throw new Error("customUserId обязателен");
  try {
    const response = await axios.get(`${BASE_URL}/users/${customUserId}/completed-dates`);
    return response.data;
  } catch (error) {
    console.error("Ошибка получения дат:", error);
    throw error;
  }
}

export const getGeneraleText = async (telegramId, goalsDone, goalsInProgress, userTag, formattedDate, series = 0, language = 'ru') => {
  try {
    if (!telegramId) {
      throw new Error("Нет telegramId для отчёта");
    }

    const response = await axios.post(`${BASE_URL}/generate-report/${telegramId}`, {
      goalsDone,
      goalsInProgress,
      userTag,
      formattedDate,
      series: series || 0,
      language: language === 'en' ? 'en' : 'ru',
    });

    const { message, success } = response.data;

    if (!success || !message) throw new Error("Не удалось создать отчёт");
    return message;
  } catch (err) {
    console.error("❌ Ошибка при генерации отчёта:", err);
    throw err;
  }
};

export async function initializeAchievements(userId) {
  const achievements = ACHIEVEMENT_TEMPLATES;

  try {
    const res = await axios.post(`${BASE_URL}/users/${userId}/achievements`, {
      achievements
    });
    return res.data;
  } catch (error) {
    console.error("Ошибка при инициализации достижений:", error.response?.data || error.message);
    throw error;
  }
}

export async function getAchievements(userId) {
  try {
    const res = await axios.get(`${BASE_URL}/users/${userId}/achievements`);
    return Array.isArray(res.data)
      ? res.data.map(decorateAchievementArtwork)
      : res.data;
  } catch (error) {
    console.error("Ошибка при получении достижений:", error.response?.data || error.message);
    throw error;
  }
}

export async function achievementNewStatus(achievement, userId) {
  try {
    const response = await axios.put(
      `${BASE_URL}/users/${userId}/achievements/${achievement.id}/status`,
      { newStatus: "my", ...((achievement.templateId === "v2:2" || achievement.templateId === "27" && achievement.type === "event_based") ? { event: "tutorial_completed" } : {}) }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error updating achievement:", error.response?.data || error.message);
    throw error;
  }
}

export async function makingPicture(isModalOpen, username) {
  try {
    const response = await axios.post(`${BASE_URL}/achievement/share`, {
      title: isModalOpen.title,
      description: isModalOpen.description,
      username: username || "user",
    });

    if (response && response.data && response.data.success) {
      return response.data.url;
    } else {
      throw new Error(response?.data?.message || "Некорректный ответ от сервера");
    }
  } catch (error) {
    console.error("Ошибка генерации изображения:", error);
    // Используем более надежный placeholder сервис
    return `https://placehold.co/1200x630/0b0b0b/ffffff?text=${encodeURIComponent(isModalOpen.title)}`;
  }
}

export async function getMakingPicture(achievement, user) {
  try {
    const response = await axios.post(`${BASE_URL}/achievement/share`, {
      title: achievement.title,
      description: achievement.description,
      username: user.username || user.first_name || "Пользователь"
    });

    // Проверяем, что ответ существует и имеет правильный формат
    if (response && response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(response?.data?.message || "Некорректный ответ от сервера");
    }
  } catch (error) {
    console.error("Ошибка share-карточки:", error);
    // Используем более надежный placeholder сервис
    return {
      success: true,
      url: `https://placehold.co/1200x630/0b0b0b/ffffff?text=${encodeURIComponent(achievement.title)}`
    };
  }
}

export async function clearAchievementImages() {
  return Promise.resolve();
}

export async function addCustomGoal(userId, title, category) {
  if (!userId || !title || !category) {
    throw new Error("userId, title, and category are required");
  }

  try {
    const response = await axios.post(`${BASE_URL}/custom-goals`, {
      userId,
      title,
      category
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка добавления пользовательской цели:", error);
    throw error;
  }
}

/**
 * POST /api/saving-goals — добавить цель в календарь на период.
 * @param {string|number} userId — telegramId
 * @param {{ idGoals: string|number, status?: string }} goalData — id цели и статус (обычно "in_progress")
 * @param {string|null} [targetDate] — "YYYY-MM-DD", с какой даты; по умолчанию сегодня на сервере
 * @param {30|60|120|null} [selectedOption] — период цели (30 / 60 / 120): столько же дней в календаре и столько дней с этой целью
 */
export async function addSavingGoal(userId, goalData, targetDate = null, selectedOption = null) {
  try {
    const response = await axios.post(`${BASE_URL}/saving-goals`, {
      userId,
      goalData,
      targetDate,
      selectedOption
    });

    const userData = response.data.user || {};
    const savingGoals = userData.savingGoals || [];

    return { success: true, data: { ...userData, savingGoals } };
  } catch (error) {
    console.error('Ошибка при добавлении цели:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }

}

/** GET /api/saving-goals — полный календарь. Параметр: userId (telegramId). */
export async function getUserSavingGoals(userId) {
  try {
    const response = await axios.get(`${BASE_URL}/saving-goals`, {
      params: { userId }
    });

    if (!Array.isArray(response.data.savingGoals)) throw new Error("Некорректный ответ календаря");
    const savingGoals = response.data.savingGoals;

    return { success: true, savingGoals };
  } catch (error) {
    console.error('Ошибка при получении целей:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    throw new Error(errorMessage);
  }
}

export async function getUserSavingGoalsWithAutoPeriod(userId) {
  try {
    const response = await axios.get(`${BASE_URL}/saving-goals`, {
      params: { userId, autoPeriod: 'true' }
    });

    const { savingGoals, period, daysPassed } = response.data;

    return { success: true, savingGoals, period, daysPassed };
  } catch (error) {
    console.error('Ошибка при получении целей с автоматическим периодом:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }
}

export async function updateUserSavingGoals(userId, goalsArray) {
  try {
    const response = await axios.put(`${BASE_URL}/saving-goals`, {
      userId,
      goalsArray
    });

    // Убедимся, что полученные данные являются объектами
    const userData = response.data.user || {};
    // savingGoals уже массив объектов, не нужно парсить
    const savingGoals = userData.savingGoals || [];

    return { success: true, data: { ...userData, savingGoals } };
  } catch (error) {
    console.error('Ошибка при обновлении целей:', error);
    // Добавляем больше информации об ошибке
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }
}

export async function generateSavingGoalsReport(userId, period, goalsArray) {
  try {
    const response = await axios.post(`${BASE_URL}/saving-goals?generateReport=true`, {
      userId,
      period,
      goalsArray
    });

    const { reportData, reportText } = response.data;
    // reportData уже содержит структурированные данные, не нужно парсить

    return { success: true, reportData, reportText };
  } catch (error) {
    console.error('Ошибка при генерации отчета по целям:', error);
    // Добавляем больше информации об ошибке
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }
}

export async function updateSavingGoalStatus(userId, date, goalId, newStatus) {
  try {
    const response = await axios.put(`${BASE_URL}/saving-goals?type=updateGoalStatus`, {
      userId,
      date,
      goalId,
      newStatus
    });

    const userData = response.data.user || {};
    const savingGoals = userData.savingGoals || [];

    return { success: true, data: { ...userData, savingGoals } };
  } catch (error) {
    console.error('Ошибка при обновлении статуса цели:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }
}

export async function removeUserSavingGoalByIndex(userId, index) {
  try {
    const response = await axios.delete(`${BASE_URL}/saving-goals`, {
      params: { userId, index }
    });

    // Убедимся, что полученные данные являются объектами
    const userData = response.data.user || {};
    // savingGoals уже массив объектов, не нужно парсить
    const savingGoals = userData.savingGoals || [];

    return { success: true, data: { ...userData, savingGoals } };
  } catch (error) {
    console.error('Ошибка при удалении цели:', error);
    // Добавляем больше информации об ошибке
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }
}

export async function removeSavingGoalFromToday(userId, goalId) {
  try {
    const response = await axios.post(`${BASE_URL}/saving-goals/remove-today`, {
      userId,
      goalId
    });

    const userData = response.data.user || {};
    const savingGoals = userData.savingGoals || [];

    return { success: true, data: { ...userData, savingGoals } };
  } catch (error) {
    console.error('Ошибка при удалении цели с сегодняшней даты:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }
}

/**
 * POST /api/saving-goals?extend=true
 * Тело: { userId } — telegramId.
 * Дописывает 120 дней после последней даты; история сохраняется; на новые дни — те же цели, что на последнем заполненном дне.
 */
export async function appendSavingGoalsDays(userId) {
  try {
    const response = await axios.post(`${BASE_URL}/saving-goals?extend=true`, { userId });

    const userData = response.data.user || {};
    const savingGoals = userData.savingGoals || [];

    return { success: true, data: { ...userData, savingGoals } };
  } catch (error) {
    console.error('Ошибка при дописывании дней в savingGoals:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }
}

/** @deprecated Используй appendSavingGoalsDays */
export const extendSavingGoalsArray = appendSavingGoalsDays;

/**
 * POST /api/saving-goals?resetStatuses=true
 * Тело: { userId } — telegramId.
 * savingGoals: даты без изменений, в goalData status → not_started.
 * Goal (таблица): у всех целей пользователя status → not_started, selectedOption → 0,
 * startDate/completionDate → null, progress → 0.
 */
export async function resetSavingGoalsStatuses(userId) {
  try {
    const response = await axios.post(`${BASE_URL}/saving-goals?resetStatuses=true`, { userId });

    const userData = response.data.user || {};
    const savingGoals = userData.savingGoals || [];

    return { success: true, data: { ...userData, savingGoals } };
  } catch (error) {
    console.error('Ошибка при сбросе статусов savingGoals:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
  }
}
