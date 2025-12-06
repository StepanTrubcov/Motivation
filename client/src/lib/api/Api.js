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
    console.log('Running on server, skipping API call');
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

  const userData = WebApp.initDataUnsafe?.user ||  {
    id: 123,
    first_name: 'testBot',
    username: 'username',
    photo_url: null,
  };

  console.log('userData:', userData);
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

      console.log("Профиль создан/обновлён:", postResponse.data);
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

  console.log(`Updating status for goal ${goalId} to ${newStatus} for user ${customUserId}`);
  console.log(`Selected option:`, selectedOption);
  
  try {
    // Передаем selectedOption в API endpoint
    const requestData = { newStatus };
    // Передаем selectedOption, даже если он равен 0
    if (selectedOption !== null && selectedOption !== undefined) {
      requestData.selectedOption = selectedOption;
    }
    
    console.log('Sending request data:', requestData);
    
    await axios.put(`${BASE_URL}/goals/${customUserId}/${goalId}`, requestData);
    console.log(`Статус цели ${goalId} для пользователя ${customUserId} изменён на ${newStatus}`);

  } catch (error) {
    toast.error("Извините произошла ошибка. Попробуйте снова.");
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

export async function initializeUserGoals(customUserId) {
  if (!customUserId) {
    console.error("customUserId is undefined in initializeUserGoals");
    throw new Error("customUserId is required");
  }

  console.log('Initializing goals for user:', customUserId);

  const goalsArray = [
    // === SPORT ===
    { id: "1", title: "Пробежать 1 км", points: 10, status: "not_started", category: "Sport", completionDate: null, description: "Пробегайте по 1 км каждый день на протяжении 30 дней. Это укрепит сердце и повысит выносливость.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "3", title: "Пробежать 5 км", points: 20, status: "not_started", category: "Sport", completionDate: null, description: "Пробегайте по 5 км несколько раз в неделю. Это укрепит сердце и мышцы.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "5", title: "Сделать 50 приседаний", points: 25, status: "not_started", category: "Sport", completionDate: null, description: "Ежедневно делайте по 50 приседаний для укрепления ног и ягодиц.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "8", title: "Сделать 20 отжиманий", points: 15, status: "not_started", category: "Sport", completionDate: null, description: "Отжимайтесь ежедневно для укрепления мышц груди и рук.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "14", title: "Пройти 5000 шагов", points: 20, status: "not_started", category: "Sport", completionDate: null, description: "Проходите 5000 шагов ежедневно. Это поддержит здоровье и тонус.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "18", title: "Утренняя зарядка 10 минут", points: 15, status: "not_started", category: "Sport", completionDate: null, description: "Делайте утреннюю зарядку для энергии на день.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "25", title: "Сделать планку 1 минуту", points: 20, status: "not_started", category: "Sport", completionDate: null, description: "Держите планку по 1 минуте ежедневно. Это укрепит мышцы кора.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "49", title: "Сделать 15 минут йоги", points: 20, status: "not_started", category: "Sport", completionDate: null, description: "Практикуйте йогу ежедневно для гибкости и спокойствия.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "51", title: "Пройти пешком на работу", points: 15, status: "not_started", category: "Sport", completionDate: null, description: "Замените транспорт пешей прогулкой — заряд бодрости на день.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "52", title: "Покататься на велосипеде 30 минут", points: 20, status: "not_started", category: "Sport", completionDate: null, description: "Катайтесь на велосипеде для здоровья и удовольствия.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "61", title: "Сделать растяжку 10 минут", points: 15, status: "not_started", category: "Sport", completionDate: null, description: "Растягивайтесь ежедневно для гибкости и здоровья суставов.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "62", title: "Сделать 200 прыжков на скакалке", points: 25, status: "not_started", category: "Sport", completionDate: null, description: "Прыжки на скакалке улучшают координацию и кардио.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "63", title: "Погулять 30 минут на свежем воздухе", points: 10, status: "not_started", category: "Sport", completionDate: null, description: "Прогулка помогает снять стресс и улучшает настроение.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "64", title: "Сделать разминку перед началом дня", points: 10, status: "not_started", category: "Sport", completionDate: null, description: "Небольшая разминка активирует мышцы и улучшает кровообращение.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "65", title: "Сделать растяжку после сна", points: 10, status: "not_started", category: "Sport", completionDate: null, description: "Мягко разомните тело после сна для энергии и гибкости.", userId: customUserId, progress: 1, selectedOption: 0 },

    // === DISCIPLINE ===
    { id: "4", title: "Кодить 1 час за ноутбуком", points: 30, status: "not_started", category: "Discipline", completionDate: null, description: "Программируйте ежедневно для развития дисциплины и навыков.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "16", title: "Облиться холодной водой", points: 15, status: "not_started", category: "Discipline", completionDate: null, description: "Закаляйтесь холодной водой для укрепления духа и тела.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "35", title: "Лечь спать до 23:00", points: 25, status: "not_started", category: "Discipline", completionDate: null, description: "Соблюдайте режим сна для восстановления энергии.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "36", title: "Рано проснуться", points: 20, status: "not_started", category: "Discipline", completionDate: null, description: "Начинайте день рано — для продуктивности и спокойствия.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "45", title: "2 часа без телефона", points: 30, status: "not_started", category: "Discipline", completionDate: null, description: "Отложите телефон, чтобы сосредоточиться на важных делах.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "54", title: "Составить распорядок дня", points: 20, status: "not_started", category: "Discipline", completionDate: null, description: "Распланируйте свой день и следуйте плану.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "66", title: "Убрать рабочее место", points: 10, status: "not_started", category: "Discipline", completionDate: null, description: "Поддерживайте порядок на столе — это помогает концентрации.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "68", title: "Провести день без сладкого", points: 25, status: "not_started", category: "Discipline", completionDate: null, description: "Контролируйте свои привычки и укрепляйте дисциплину.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "69", title: "Поработать 2 часа без отвлечений", points: 25, status: "not_started", category: "Discipline", completionDate: null, description: "Сосредоточьтесь на задаче и не переключайтесь.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "70", title: "Проснуться без телефона в руках", points: 15, status: "not_started", category: "Discipline", completionDate: null, description: "Начните утро без гаджетов для чистого фокуса.", userId: customUserId, progress: 1, selectedOption: 0 },

    // === SELF_DEVELOPMENT ===
    { id: "2", title: "Читать книгу 20 минут", points: 20, status: "not_started", category: "Self_development", completionDate: null, description: "Читайте ежедневно для развития мышления и внимания.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "6", title: "Учить английский", points: 20, status: "not_started", category: "Self_development", completionDate: null, description: "Учите новые английские слова ежедневно.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "13", title: "Поработать над стартапом", points: 20, status: "not_started", category: "Self_development", completionDate: null, description: "Развивайте свои идеи и продвигайте личные проекты.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "24", title: "Смотреть обучающее видео", points: 15, status: "not_started", category: "Self_development", completionDate: null, description: "Смотрите обучающие материалы для роста.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "34", title: "Выучить 20 английских слов", points: 40, status: "not_started", category: "Self_development", completionDate: null, description: "Пополняйте словарный запас каждый день.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "47", title: "Прочитать статью о саморазвитии", points: 10, status: "not_started", category: "Self_development", completionDate: null, description: "Читайте статьи о личностном росте ежедневно.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "55", title: "Прослушать подкаст о личностном росте", points: 15, status: "not_started", category: "Self_development", completionDate: null, description: "Слушайте полезные подкасты о саморазвитии.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "71", title: "Посмотреть документальный фильм", points: 20, status: "not_started", category: "Self_development", completionDate: null, description: "Расширяйте кругозор, изучая новые темы.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "72", title: "Записать 3 идеи для улучшения жизни", points: 15, status: "not_started", category: "Self_development", completionDate: null, description: "Ежедневно фиксируйте идеи и наблюдения.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "73", title: "Вести дневник благодарности", points: 10, status: "not_started", category: "Self_development", completionDate: null, description: "Каждый вечер записывайте 3 вещи, за которые благодарны.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "74", title: "Научиться новому навыку 30 минут", points: 25, status: "not_started", category: "Self_development", completionDate: null, description: "Ежедневно осваивайте хоть что-то новое.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "75", title: "Придумать цель на завтра", points: 10, status: "not_started", category: "Self_development", completionDate: null, description: "Планируйте следующий день заранее для ясности и фокуса.", userId: customUserId, progress: 1, selectedOption: 0 },

    // === SPIRITUALITY === (оставлены как у тебя)
    { id: "57", title: "Прочитать одну главу Евангелия", points: 20, status: "not_started", category: "Spirituality", completionDate: null, description: "Читайте ежедневно одну главу Евангелия для укрепления веры.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "58", title: "Помолиться утром и вечером", points: 15, status: "not_started", category: "Spirituality", completionDate: null, description: "Начинайте и завершайте день молитвой и благодарностью.", userId: customUserId, progress: 1, selectedOption: 0 },
    { id: "60", title: "Прочитать молитву перед сном", points: 10, status: "not_started", category: "Spirituality", completionDate: null, description: "Завершайте день молитвой, осмысливая прожитое.", userId: customUserId, progress: 1, selectedOption: 0 },
  ];


  try {
    const existingGoals = await getAllGoals(customUserId);

    // Проверяем, есть ли уже цели у пользователя
    if (existingGoals && existingGoals.length > 0) {
      console.log(`✅ У пользователя ${customUserId} уже есть ${existingGoals.length} целей. Пропускаем инициализацию.`);
      return false;
    }

    console.log(`📤 Отправка ${goalsArray.length} целей на сервер...`);
    const response = await axios.post(`${BASE_URL}/initialize-goals/${customUserId}`, {
      goalsArray
    });

    console.log('✅ Цели успешно инициализированы:', response.data);
    return true;
  } catch (error) {
    console.error("❌ Ошибка инициализации целей:", error);
    throw error;
  }
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

export const getGeneraleText = async (telegramId, goalsDone, goalsInProgress, userTag) => {
  try {
    if (!telegramId) {
      console.error("❌ Нет telegramId для отчёта");
      return;
    }
    const response = await axios.post(`${BASE_URL}/generate-report/${telegramId}`, {
      goalsDone,
      goalsInProgress,
      userTag,
    });

    const { message, success } = response.data;

    return message;
  } catch (err) {
    console.error("❌ Ошибка при генерации отчёта:", err);
    toast.error("Произошла ошибка при создании отчёта");
  }
};

export async function initializeAchievements(userId) {

  const achievements = [
    {
      "id": "1",
      "title": "90 дней бега",
      "description": "Вы пробегали по 1 км в течение 90 дней. Это доказательство вашей дисциплины и силы духа.",
      "requirement": "Пробегать минимум 1 км на протяжении 90 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/8589MTrk/2025-09-10-17-24-46-no-bg-preview-carve-photos.png",
      "points": 100,
      "type": "goal_based",
      "goalIds": ["1"],
      "target": 90
    },
    {
      "id": "2",
      "title": "Пятёрка выносливости",
      "description": "Вы пробегали по 5 км в течение 60 дней. Ваша настойчивость заслуживает уважения.",
      "requirement": "Пробегать минимум 5 км на протяжении 60 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/9Q6JNJXJ/2025-09-10-17-25-10-no-bg-preview-carve-photos.png",
      "points": 250,
      "type": "goal_based",
      "goalIds": ["3"],
      "target": 60
    },
    {
      "id": "3",
      "title": "Книжный марафон",
      "description": "Вы в течение 60 дней читали книги. Эти знания делают вас сильнее и мудрее.",
      "requirement": "Читать минимум 15 страниц на протяжении 60 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/50n5131c/2025-09-10-17-24-51-no-bg-preview-carve-photos.png",
      "points": 150,
      "type": "goal_based",
      "goalIds": ["2"],
      "target": 60
    },
    {
      "id": "4",
      "title": "Здоровый рацион",
      "description": "Вы придерживались здорового питания 60 дней. Ваше тело скажет вам спасибо!",
      "requirement": "Следовать принципам здорового питания на протяжении 60 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/qBFnLgvG/2025-09-10-17-25-30-no-bg-preview-carve-photos.png",
      "points": 200,
      "type": "goal_based",
      "goalIds": ["68"],
      "target": 60
    },
    {
      "id": "5",
      "title": "Ледяная закалка",
      "description": "Вы закалялись 60 дней. Ваша сила воли закалена, как сталь!",
      "requirement": "Практиковать закаливание (например, холодный душ) на протяжении 60 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/BZP5R2yz/2025-09-10-17-25-05-no-bg-preview-carve-photos.png",
      "points": 150,
      "type": "goal_based",
      "goalIds": ["16"],
      "target": 60
    },
    {
      "id": "6",
      "title": "Кодерский марафон",
      "description": "Вы кодили по 1 час в течение 60 дней. Ваш код — это искусство!",
      "requirement": "Заниматься программированием минимум 1 час на протяжении 60 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/Zn2FWxRW/2025-09-10-17-24-55-no-bg-preview-carve-photos.png",
      "points": 300,
      "type": "goal_based",
      "goalIds": ["4"],
      "target": 60
    },
    {
      "id": "7",
      "title": "Полгода прогресса",
      "description": "Вы стабильно двигались к своим целям в течение полугода. Это настоящий прорыв!",
      "requirement": "Соблюдать дисциплину в любых активностях приложения в течение 180 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/BnbnwB7L/2025-09-10-17-25-39-no-bg-preview-carve-photos.png",
      "points": 500,
      "type": "time_based",
      "target": 180
    },
    {
      "id": "8",
      "title": "Сила отжиманий",
      "description": "Вы отжимались по 20 раз в течение 60 дней. Ваши мышцы — это мощь!",
      "requirement": "Выполнять минимум 20 отжиманий на протяжении 60 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/rsq8G1tp/2025-09-10-17-25-21-no-bg-preview-carve-photos.png",
      "points": 150,
      "type": "goal_based",
      "goalIds": ["8"],
      "target": 60
    },
    {
      "id": "9",
      "title": "Ранний старт",
      "description": "Вы вставали не позже 6 утра 90 дней. Ваш день начинается с победы!",
      "requirement": "Вставать не позже 6:00 утра на протяжении 90 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/MTSxx75Y/2025-09-10-17-25-45-no-bg-preview-carve-photos.png",
      "points": 200,
      "type": "goal_based",
      "goalIds": ["36"],
      "target": 90
    },
    {
      "id": "10",
      "title": "Великий дисциплинатор",
      "description": "Вы пользовались приложением и соблюдали дисциплину целый год. Вы — легенда!",
      "requirement": "Использовать приложение и выполнять задачи дисциплины ежедневно в течение 365 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/gJXRFPMh/2025-09-10-17-25-26-no-bg-preview-carve-photos.png",
      "points": 1000,
      "type": "time_based",
      "target": 365
    },
    {
      "id": "11",
      "title": "Красавчик!",
      "description": "Вы начали использовать приложение и сделали первый шаг к своим целям. Ты — красавчик!",
      "requirement": "",
      "status": "my",
      "image": "https://i.postimg.cc/3NRrPtWR/2ba45392-3b7a-48bc-9b47-7f81e64b0867.png",
      "points": 0
    }
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
    return response.data
  } catch (error) {
    console.error("❌ Error updating achievement:", error.response?.data || error.message);
  }
}

export async function generateAchievementShare(achievement, user) {
  try {
    const response = await axios.post(`${BASE_URL}/achievement/share`, {
      title: achievement.title,
      description: achievement.description,
      points: achievement.points,
      username: user.username || user.first_name || "Пользователь"
    });

    // Проверяем, что ответ существует и имеет правильный формат
    if (response && response.data && response.data.success) {
      return response.data.url;
    } else {
      throw new Error(response?.data?.message || "Некорректный ответ от сервера");
    }
  } catch (error) {
    console.error("Ошибка share-карточки:", error);
    return `https://via.placeholder.com/1200x630/0b0b0b/ffffff.png?text=${encodeURIComponent(achievement.title)}`;
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
    return `https://via.placeholder.com/1200x630/0b0b0b/ffffff.png?text=${encodeURIComponent(isModalOpen.title)}`;
  }
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