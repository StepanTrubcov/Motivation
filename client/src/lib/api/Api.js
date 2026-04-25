import axios from 'axios';
import { toast } from "react-hot-toast";

let WebApp;
let isWebAppLoading = true;

if (typeof window !== 'undefined') {
  import('@twa-dev/sdk').then(module => {
    WebApp = module.default;
    isWebAppLoading = false;
  });
}

const BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : '/api';

export const addProfileApi = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  let waitAttempts = 0;
  while (isWebAppLoading && waitAttempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    waitAttempts++;
  }

  if (!WebApp) {
    console.error('WebApp SDK failed to load');
    return null;
  }

  WebApp.ready();

  const userData = WebApp.initDataUnsafe?.user || {
    id: 123,
    first_name: 'testBot',
    username: 'username',
    photo_url: null,
  };

  if (!userData) {
    console.error("Нет данных пользователя от Telegram");
    return null;
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
        return null;
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

export async function getAllGoals(customUserId) {
  if (!customUserId) {
    console.error("customUserId is undefined");
    throw new Error("customUserId is required");
  }
  try {
    const response = await axios.get(`${BASE_URL}/goals/${customUserId}`);
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

export async function getAllStatus(customUserId, goalId, newStatus, selectedOption = null) {
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

    await axios.put(`${BASE_URL}/goals/${customUserId}/${goalId}`, requestData);

  } catch (error) {
    toast.error("Извините произошла ошибка. Попробуйте снова.", {
      style: {
        background: '#333',
        color: '#fff',
        marginTop: '80px',
      }
    });
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

export const TEMPLATE_GOALS_ARRAY = [

  /* ================= SPORT ================= */
  
  { id:"1", title:"Пробежать 1 км", points:10, category:"Sport" },
  { id:"3", title:"Пробежать 5 км", points:20, category:"Sport" },
  { id:"5", title:"Сделать 50 приседаний", points:25, category:"Sport" },
  { id:"8", title:"Сделать 20 отжиманий", points:15, category:"Sport" },
  { id:"14", title:"Пройти 5000 шагов", points:20, category:"Sport" },
  { id:"18", title:"Утренняя зарядка 10 минут", points:15, category:"Sport" },
  { id:"25", title:"Сделать планку 1 минуту", points:20, category:"Sport" },
  { id:"49", title:"Сделать 15 минут йоги", points:20, category:"Sport" },
  { id:"52", title:"Покататься на велосипеде 30 минут", points:20, category:"Sport" },
  { id:"61", title:"Сделать растяжку 10 минут", points:15, category:"Sport" },
  { id:"62", title:"Сделать 200 прыжков на скакалке", points:25, category:"Sport" },
  { id:"63", title:"Погулять 30 минут на свежем воздухе", points:10, category:"Sport" },
  { id:"64", title:"Сделать разминку перед началом дня", points:10, category:"Sport" },
  { id:"65", title:"Сделать растяжку после сна", points:10, category:"Sport" },
  
  { id:"131", title:"Пробежка утром", points:20, category:"Sport" },
  { id:"132", title:"Сделать тренировку ног 15 минут", points:20, category:"Sport" },
  { id:"133", title:"Сделать тренировку рук 15 минут", points:20, category:"Sport" },
  { id:"134", title:"Пройти 10 000 шагов", points:25, category:"Sport" },
  { id:"135", title:"Сделать упражнения для спины", points:15, category:"Sport" },
  { id:"136", title:"Сделать разминку шеи", points:10, category:"Sport" },
  { id:"137", title:"Сделать вечернюю прогулку", points:15, category:"Sport" },
  { id:"138", title:"Сделать дыхательные упражнения", points:10, category:"Sport" },
  { id:"139", title:"Сделать тренировку корпуса", points:20, category:"Sport" },
  { id:"140", title:"Выпить стакан воды утром", points:10, category:"Sport" },
  
  
  /* ================= DISCIPLINE ================= */
  
  { id:"4", title:"Кодить 1 час", points:30, category:"Discipline" },
  { id:"16", title:"Облиться холодной водой", points:15, category:"Discipline" },
  { id:"35", title:"Лечь спать до 23:00", points:25, category:"Discipline" },
  { id:"36", title:"Рано проснуться", points:20, category:"Discipline" },
  { id:"45", title:"2 часа без телефона", points:30, category:"Discipline" },
  { id:"54", title:"Составить распорядок дня", points:20, category:"Discipline" },
  { id:"66", title:"Убрать рабочее место", points:10, category:"Discipline" },
  { id:"68", title:"Провести день без сладкого", points:25, category:"Discipline" },
  { id:"69", title:"Поработать 2 часа без отвлечений", points:25, category:"Discipline" },
  { id:"70", title:"Проснуться без телефона", points:15, category:"Discipline" },
  
  { id:"144", title:"Проснуться без откладывания будильника", points:20, category:"Discipline" },
  { id:"145", title:"Сделать план на завтра вечером", points:15, category:"Discipline" },
  { id:"146", title:"Не заходить в соцсети утром", points:20, category:"Discipline" },
  { id:"147", title:"Сфокусироваться на работе 1 час", points:25, category:"Discipline" },
  { id:"148", title:"Сделать сложную задачу дня", points:25, category:"Discipline" },
  { id:"149", title:"Закончить начатое дело", points:20, category:"Discipline" },
  { id:"150", title:"Соблюдать режим питания", points:15, category:"Discipline" },
  { id:"151", title:"Не есть перед сном", points:15, category:"Discipline" },
  { id:"152", title:"Работать по таймеру Pomodoro", points:15, category:"Discipline" },
  { id:"153", title:"Подготовить вещи на завтра", points:10, category:"Discipline" },
  { id:"154", title:"Отключить лишние уведомления", points:10, category:"Discipline" },
  { id:"155", title:"Сделать цифровой детокс 1 час", points:15, category:"Discipline" },
  
  
  /* ================= SELF DEVELOPMENT ================= */
  
  { id:"2", title:"Читать книгу 20 минут", points:20, category:"Self_development" },
  { id:"6", title:"Учить английский", points:20, category:"Self_development" },
  { id:"13", title:"Поработать над стартапом", points:20, category:"Self_development" },
  { id:"24", title:"Смотреть обучающее видео", points:15, category:"Self_development" },
  { id:"34", title:"Выучить 20 английских слов", points:40, category:"Self_development" },
  { id:"47", title:"Прочитать статью о саморазвитии", points:10, category:"Self_development" },
  { id:"55", title:"Прослушать подкаст о личностном росте", points:15, category:"Self_development" },
  { id:"71", title:"Посмотреть документальный фильм", points:20, category:"Self_development" },
  { id:"72", title:"Записать 3 идеи", points:15, category:"Self_development" },
  { id:"73", title:"Вести дневник благодарности", points:10, category:"Self_development" },
  { id:"74", title:"Учить новый навык 30 минут", points:25, category:"Self_development" },
  { id:"75", title:"Поставить цель на завтра", points:10, category:"Self_development" },
  
  { id:"158", title:"Выучить 3 новых слова", points:10, category:"Self_development" },
  { id:"159", title:"Посмотреть образовательное видео", points:15, category:"Self_development" },
  { id:"160", title:"Написать запись в дневник", points:10, category:"Self_development" },
  { id:"161", title:"Повторить английские слова", points:15, category:"Self_development" },
  { id:"162", title:"Прочитать полезную статью", points:10, category:"Self_development" },
  { id:"163", title:"Изучить новую тему 10 минут", points:15, category:"Self_development" },
  { id:"164", title:"Записать идею проекта", points:10, category:"Self_development" },
  { id:"165", title:"Посмотреть лекцию", points:20, category:"Self_development" },
  { id:"166", title:"Сделать заметки по обучению", points:15, category:"Self_development" },
  { id:"167", title:"Практиковать иностранный язык", points:20, category:"Self_development" },
  { id:"168", title:"Сделать мини-исследование темы", points:20, category:"Self_development" },
  { id:"169", title:"Посмотреть интервью эксперта", points:15, category:"Self_development" },
  
  
  /* ================= SPIRITUALITY ================= */
  
  { id:"57", title:"Прочитать одну главу Евангелия", points:20, category:"Spirituality" },
  { id:"58", title:"Помолиться утром и вечером", points:15, category:"Spirituality" },
  { id:"60", title:"Прочитать молитву перед сном", points:10, category:"Spirituality" },
  
  { id:"174", title:"Помолиться утром", points:10, category:"Spirituality" },
  { id:"175", title:"Помолиться вечером", points:10, category:"Spirituality" },
  { id:"176", title:"Прочитать духовный текст", points:15, category:"Spirituality" },
  { id:"177", title:"Поблагодарить Бога за день", points:10, category:"Spirituality" },
  { id:"178", title:"Помолиться своими словами", points:10, category:"Spirituality" },
  { id:"179", title:"Помолиться за близких", points:15, category:"Spirituality" },
  { id:"180", title:"Провести 5 минут в молитве", points:15, category:"Spirituality" },
  { id:"181", title:"Прочитать псалом", points:15, category:"Spirituality" }
  
];

export async function initializeUserGoals(customUserId) {
  if (!customUserId) {
    console.error("customUserId is undefined in initializeUserGoals");
    throw new Error("customUserId is required");
  }

  const goalsArray = TEMPLATE_GOALS_ARRAY;


  try {
    const existingGoals = await getAllGoals(customUserId);

    // Проверяем, есть ли уже цели у пользователя
    if (existingGoals && existingGoals.length > 0) {
      return false;
    }

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
      console.error("❌ Нет telegramId для отчёта");
      return;
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

    return message;
  } catch (err) {
    console.error("❌ Ошибка при генерации отчёта:", err);
    toast.error("Произошла ошибка при создании отчёта", {
      style: {
        background: '#333',
        color: '#fff',
      }
    });
  }
};

export async function initializeAchievements(userId) {

      const achievements = [
    {
      "id": "1",
      "title": "Красавчик!",
      "requirement": "",
      "rarity": "common",
      "status": "my",
      "image": "https://i.postimg.cc/269msf3B/image-(1).jpg",
      "gif": "https://i.postimg.cc/zfr8v0t6/Untitled-kopia-3.gif",
      "points": 0
    },
    {
      "id": "28",
      "title": "Активирован прогресс",
      "rarity": "common",
      "status": "locked",
      "image": "https://i.postimg.cc/L8VcMLD4/8G2Wy.jpg",
      "gif": "https://i.postimg.cc/WzryYkzf/213.gif",
      "requirement": "• Достичь 20 уровня\n",
      "points": 200,
      "type": "level_based",
      "target": 20
    },
    {
      "id": "27",
      "title": "В игре",
      "gif": "https://i.postimg.cc/fyjPfH7x/Untitled.gif",
      "requirement": "• Пройти обучение\n",
      "status": "locked",
      "image": "https://i.postimg.cc/13RkJZjN/h3p-S8.jpg",
      "points": 100,
      "type": "event_based",
      "rarity": "common",
    },
    {
      "id": "2",
      "title": "30 дней бега",
      "gif": "https://i.postimg.cc/0yN7300y/Untitled-kopia-4.gif",
      "requirement": "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 30 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/MpCkKwQK/899d46fe-fff2-45d0-85c8-1bafc42b7159.png",
      "points": 250,
      "type": "goal_based",
      "goalIds": [
        "1"
      ],
      "rarity": "common",
      "target": 30
    },
    {
      "id": "3",
      "title": "Книжный марафон",
      "gif": "https://i.postimg.cc/BZV3Hq7c/Untitled-kopia-9.gif",
      "requirement": "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 30 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/YScT80Q1/image-(2).jpg",
      "points": 250,
      "type": "goal_based",
      "goalIds": [
       "2"
      ],
      "rarity": "common",
      "target": 30
    },
    {
      "id": "4",
      "title": "Кодерский марафон",
      "requirement": "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 30 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/d0kBmqFQ/image-(1).jpg",
      "gif": "https://i.postimg.cc/8cFqt6Xc/Untitled-kopia.gif",
      "points": 250,
      "type": "goal_based",
      "goalIds": [
        "4"
      ],
      "rarity": "common",
      "target": 30
    },
    {
      "id": "5",
      "title": "Здоровый рацион",
      "requirement": "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 30 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/prdSyFMC/image-(1)-kopia.jpg",
      "points": 250,
      "type": "goal_based",
      "goalIds": [
       "68"
      ],
      "rarity": "common",
      "target": 30,
      "gif": "https://i.postimg.cc/cLsNNrr2/Untitled-(3).gif"
    },
    {
      "id": "6",
      "title": "Ранний старт",
      "requirement": "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 30 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/dtLXYrB6/image-kopia.jpg",
      "gif": "https://i.postimg.cc/jj1VNcZx/Untitled234.gif",
      "points": 250,
      "type": "goal_based",
      "goalIds": [
       "36"
      ],
      "rarity": "common",
      "target": 30
    },
    {
      "id": "7",
      "title": "Ледяная закалка",
      "gif": "https://i.postimg.cc/tgjnbdh9/Untitled-kopia-6.gif",
      "requirement": "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 30 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/nLtwB5tT/dddbeae1-1d89-463d-a5e3-91d2b9e6adaa.png",
      "points": 250,
      "type": "goal_based",
      "goalIds": [
        "16"
      ],
      "rarity": "common",
      "target": 30
    },
    {
      "id": "8",
      "gif": "https://i.postimg.cc/PqyJkgXg/Untitled2312.gif",
      "title": "Сила отжиманий",
      "requirement": "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 30 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/SN2Z5qSL/image-kopia-2.jpg",
      "points": 250,
      "type": "goal_based",
      "goalIds": [
        "8"
      ],
      "rarity": "common",
      "target": 30
    },
    {
      "id": "9",
      "gif": "https://i.postimg.cc/jjfHJ2CP/2.gif",
      "title": "Месяц прогресса",
      "requirement": "• Пользоваться ботом и приложением \n на протяжении 30 дней\n",
      "status": "locked",
      "image": "https://i.postimg.cc/SNQftmtq/d53eaa62-bd66-4b4c-b2a3-d1706214cb33.png",
      "points": 300,
      "type": "time_based",
      "rarity": "common",
      "target": 30
    },
    {
      "id": "10",
      "title": "60 дней бега",
      "gif": "https://i.postimg.cc/L8RxsWKW/Untitled-(1).gif",
      "requirement": "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 60 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/HkhH4Tkq/12d6730e-ce3c-4b7e-a7ed-e3728d47a448-kopia.png",
      "points": 500,
      "type": "goal_based",
      "goalIds": [
        "1"
      ],
      "rarity": "rare",
      "target": 60
    },
    {
      "id": "11",
      "title": "Книжный марафон",
      "gif": "https://i.postimg.cc/SNbrZPsp/Untitled-(1)-kopia.gif",
      "requirement": "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 60 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/bNYj7ZGC/image-(3).jpg",
      "points": 500,
      "type": "goal_based",
      "goalIds": [
        "2"
      ],
      "rarity": "rare",
      "target": 60
    },
    {
      "id": "12",
      "gif": "https://i.postimg.cc/Qd0Jdxqg/Untitled.gif",
      "title": "Кодерский марафон",
      "requirement": "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 60 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/fWKGfMHc/077e34ab-3f3e-422b-b45e-cc308ec45db5.png",
      "points": 500,
      "type": "goal_based",
      "goalIds": [
        "4"
      ],
      "rarity": "rare",
      "target": 60
    },
    {
      "id": "13",
      "gif": "https://i.postimg.cc/3NXg5KR7/Untitled-kopia-10.gif",
      "title": "Здоровый рацион",
      "requirement": "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 60 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/sgBbz7VV/image.jpg",
      "points": 500,
      "type": "goal_based",
      "goalIds": [
        "68"
      ],
      "rarity": "rare",
      "target": 60
    },
    {
      "id": "14",
      "gif": "https://i.postimg.cc/5NmwsNDM/Untitled-kopia23423.gif",
      "title": "Ранний старт",
      "requirement": "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 60 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/cJwjgWgm/image-(1)-kopia-2.jpg",
      "points": 500,
      "type": "goal_based",
      "goalIds": [       
"36"
      ],
      "rarity": "rare",
      "target": 60
    },
    {
      "gif": "https://i.postimg.cc/bYxbvwzK/Untitled-kopia-7.gif",
      "id": "15",
      "title": "Ледяная закалка",
      "requirement": "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 60 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/C5P6TLXZ/78478168-36c0-45f4-99c8-366e0baa665c.png",
      "points": 500,
      "type": "goal_based",
      "goalIds": [
        "16"
      ],
      "rarity": "rare",
      "target": 60
    },
    {
      "id": "16",
      "title": "Сила отжиманий ",
      "gif": "https://i.postimg.cc/DZ5xLw2P/345.gif",
      "requirement": "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 60 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/yY2vF5zG/image-(1)-kopia-3.jpg",
      "points": 500,
      "type": "goal_based",
      "goalIds": [
        "8"
      ],
      "rarity": "rare",
      "target": 60
    },
    {
      "id": "17",
      "title": "Полгода прогресса",
      "gif": "https://i.postimg.cc/RZ49HDkt/Untitled-kopia-11.gif",
      "requirement": "• Пользоваться ботом и приложением \n на протяжении 180 дней\n",
      "status": "locked",
      "image": "https://i.postimg.cc/26f4dYZ6/image-kopia-3.jpg",
      "points": 800,
      "type": "time_based",
      "rarity": "rare",
      "target": 180
    },
    {
      "id": "29",
      "title": "Закалённый системой",
      "gif": "https://i.postimg.cc/g0nNBZBS/65.gif",
      "requirement": "• Достичь 50 уровня \n",
      "status": "locked",
      "image": "https://i.postimg.cc/4yTPdF4P/Qgo-IX.jpg",
      "points": 400,
      "rarity": "rare",
      "type": "level_based",
      "target": 50
    },
    {
      "id": "18",
      "title": "120 дней бега",
      "gif": "https://i.postimg.cc/fTxhF1vn/Untitled-kopia-5.gif",
      "requirement": "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 120 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/jdWbXLDd/abc30db4-c0ce-4e0a-ac5d-d66933c97033-kopia.png",
      "points": 1000,
      "type": "goal_based",
      "goalIds": [
        "1"
      ],
      "rarity": "legendary",
      "target": 120
    },
    {
      "id": "19",
      "title": "Ледяная закалка",
      "requirement": "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 120 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/hGnRcspW/73664e2a-ece4-40a0-b985-ec6e31d57a4c.png",
      "points": 1000,
      "gif": "https://i.postimg.cc/XJpbzJsw/Untitled-kopia-8.gif",
      "type": "goal_based",
      "goalIds": [
        "16"
      ],
      "rarity": "legendary",
      "target": 120
    },
    {
      "id": "20",
      "title": "Кодерский марафон",
      "requirement": "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 90 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/nhngk9R3/2c7f25f1-85f5-49ca-96ef-5f4325f18de5.png",
      "points": 1000,
      "gif": "https://i.postimg.cc/Qx5XDFhz/Untitled-kopia-2.gif",
      "type": "goal_based",
      "goalIds": [
        "4"
      ],
      "rarity": "legendary",
      "target": 120
    },
    {
      "id": "21",
      "title": "Сила отжиманий",
      "requirement": "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 120 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/5NQhzTrW/image-(2)-kopia-2.jpg",
      "points": 1000,
      "type": "goal_based",
      "gif": "https://i.postimg.cc/x8cWt41D/5.gif",
      "goalIds": [
        "8"
      ],
      "rarity": "legendary",
      "target": 120
    },
    {
      "id": "22",
      "title": "Книжный марафон",
      "gif": "https://i.postimg.cc/bwD1pHdm/Untitled-(2).gif",
      "requirement": "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 120 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/KjGn26gL/image-(4).jpg",
      "points": 1000,
      "type": "goal_based",
      "goalIds": [
        "2"
      ],
      "rarity": "legendary",
      "target": 120
    },
    {
      "id": "23",
      "gif": "https://i.postimg.cc/YqjWzfN7/Untitled-(1)-kopia-2.gif",
      "title": "Здоровый рацион",
      "requirement": "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 120 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/hjrdp23D/image-(5).jpg",
      "points": 1000,
      "type": "goal_based",
      "goalIds": [
        "68"
      ],
      "rarity": "legendary",
      "target": 120
    },
    {
      "id": "24",
      "gif": "https://i.postimg.cc/FRDYj777/Untitled-(1)24324.gif",
      "title": "Ранний старт",
      "requirement": "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 120 раз\n",
      "status": "locked",
      "image": "https://i.postimg.cc/zGgH9zcV/image-(2)-kopia.jpg",
      "points": 1000,
      "type": "goal_based",
      "goalIds": [
        "36"
      ],
      "rarity": "legendary",
      "target": 120
    },
    {
      "id": "25",
      "title": "Великий дисциплинатор",
      "requirement": "• Пользоваться ботом и приложением \n на протяжении 365 дней\n",
      "status": "locked",
      "image": "https://i.postimg.cc/KcfnTdvK/image-(1)-kopia-4.jpg",
      "points": 1500,
      "gif": "https://i.postimg.cc/NftZJrdY/Untitled-kopia-12.gif",
      "type": "time_based",
      "rarity": "legendary",
      "target": 365
    }, 
    {
      "id": "30",
      "title": "Создатель системы",
      "requirement": "• Достичь 100 уровня\n",
      "status": "locked",
      "image": "https://i.postimg.cc/dVzywZ0K/z7ob0.jpg",
      "points": 900,
      "gif": "https://i.postimg.cc/YCJWMLCF/Untitled-kopia.gif",
      "type": "level_based",
      "rarity": "legendary",
      "target": 100
    }, 
    {
      "id": "31",
      "title": "Коллекционер",
      "requirement": "• Получить все ачивки кроме Эпических\n",
      "status": "locked",
      "image": "https://i.postimg.cc/ydNnWPkk/Zaz9K.jpg",
      "points": 1000,
      "gif": "https://i.postimg.cc/GpdXnrrR/Untitled-(1).gif",
      "type": "collection_based",
      "rarity": "legendary",
      "target": null
    }, 
    {
      "id": "26",
      "title": "Один из первых",
      "requirement": "• Эту ачивку получили первые 100\nпользователей бота.\n• Больше эту ачивку получить нельзя! \n",
      "status": "my",
      "image": "https://i.postimg.cc/05B1mwDJ/image-(1)-kopia-5.jpg",
      "points": 0,
      "gif": "https://allwebs.ru/images/2026/01/16/13d99a897de68b6dcfc0a1a35d6a2c85.gif",
      "rarity": "epic",
    }, 
  ];

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
    return res.data;
  } catch (error) {
    console.error("Ошибка при получении достижений:", error.response?.data || error.message);
    throw error;
  }
}

export async function achievementNewStatus(achievement, userId) {
  try {
    const response = await axios.put(
      `${BASE_URL}/users/${userId}/achievements/${achievement.id}/status`,
      { newStatus: "my" }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error updating achievement:", error.response?.data || error.message);
  }
}

export async function makingPicture(isModalOpen, username) {
  try {
    const response = await axios.post(`${BASE_URL}/achievement/share`, {
      title: isModalOpen.title,
      description: isModalOpen.description,
      points: isModalOpen.points || 0,
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
      points: achievement.points,
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

export async function getUserSavingGoals(userId) {
  try {
    const response = await axios.get(`${BASE_URL}/saving-goals`, {
      params: { userId }
    });

    const savingGoals = response.data.savingGoals || [];
    // savingGoals уже массив объектов, не нужно парсить

    return { success: true, savingGoals };
  } catch (error) {
    console.error('Ошибка при получении целей:', error);
    // Добавляем больше информации об ошибке
    const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка';
    return { success: false, error: errorMessage };
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