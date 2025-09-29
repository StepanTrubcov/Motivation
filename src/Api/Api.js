import WebApp from '@twa-dev/sdk';
import axios from 'axios';
import { toast } from "react-hot-toast";

const BASE_URL = 'http://localhost:5002/api';

export const addProfileApi = async () => {
  WebApp.ready();

  const userData = WebApp.initDataUnsafe?.user || {
    id: "2521351",
    first_name: "Stepan",
    username: "Stepan",
    photo_url: "https://t.me/i/userpic/320/oBN9n-AW0sT2iVFeGc17067iUAw_QccFVfwQefEbwRJFd3WRBg0IiDoe6whGY1zK.svg"
  };

  console.log('userData:', userData);
  if (!userData) {
    console.error("Нет данных пользователя от Telegram");
    return;
  }

  try {
    const postResponse = await axios.post(`${BASE_URL}/users`, {
      telegramId: userData.id,
      firstName: userData.first_name,
      username: userData.username,
      photoUrl: userData.photo_url
    });
    return postResponse.data;
  } catch (error) {
    console.error('Error in addProfile:', {
      message: error.message,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null
    });
    throw error;
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
  console.log(customUserId, points)
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

export async function getAllStatus(customUserId, goalId, newStatus) {
  if (!customUserId || !goalId || !newStatus) {
    console.error(`Invalid parameters: customUserId=${customUserId}, goalId=${goalId}, newStatus=${newStatus}`);
    throw new Error("customUserId, goalId, and newStatus are required");
  }

  console.log(`Updating status for goal ${goalId} to ${newStatus} for user ${customUserId}`);
  try {
    await axios.put(`${BASE_URL}/goals/${customUserId}/${goalId}`, { newStatus });
    console.log(`Статус цели ${goalId} для пользователя ${customUserId} изменён на ${newStatus}`);

  } catch (error) {
    toast.error("Не удалось взять цель. Попробуйте снова.");
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
    { id: "1", title: "Пробежать 1 км", points: 10, status: "not_started", completionDate: null, description: "Пробегайте по 1 км каждый день на протяжении 30 дней. Это укрепит сердце и повысит выносливость.", userId: customUserId },
    { id: "2", title: "Читать книгу 20 минут", points: 20, status: "not_started", completionDate: null, description: "Читайте по 20 минут ежедневно в течение 30 дней. Это поможет улучшить внимание и концентрацию.", userId: customUserId },
    { id: "3", title: "Совершить молитву 10 минут", points: 15, status: "not_started", completionDate: null, description: "Ежедневно посвящайте 10 минут молитве на протяжении 30 дней. Это укрепит дух и принесёт спокойствие.", userId: customUserId },
    { id: "4", title: "Кодить 1 час за ноутбуком", points: 30, status: "not_started", completionDate: null, description: "Занимайтесь программированием по 1 часу ежедневно в течение 30 дней. Это поможет развить дисциплину и навыки.", userId: customUserId },
    { id: "5", title: "Сделать 50 приседаний", points: 25, status: "not_started", completionDate: null, description: "Выполняйте по 50 приседаний каждый день на протяжении 30 дней. Это укрепит ноги и ягодицы.", userId: customUserId },
    { id: "6", title: "Учить английские слова по карточкам", points: 20, status: "not_started", completionDate: null, description: "Каждый день изучайте новые английские слова по карточкам в течение 30 дней. Это расширит ваш словарный запас.", userId: customUserId },
    { id: "7", title: "Совершить молитву", points: 15, status: "not_started", completionDate: null, description: "Молитесь на коленях ежедневно в течение 30 дней. Это укрепит духовную дисциплину и внутренний мир.", userId: customUserId },
    { id: "8", title: "Сделать 20 отжиманий", points: 15, status: "not_started", completionDate: null, description: "Выполняйте по 20 отжиманий каждый день в течение 30 дней. Это укрепит мышцы груди, рук и спины.", userId: customUserId },
    { id: "9", title: "Гулять на улице 15 минут", points: 10, status: "not_started", completionDate: null, description: "Каждый день гуляйте по 15 минут на улице на протяжении 30 дней. Это улучшит здоровье и настроение.", userId: customUserId },
    { id: "10", title: "Прогуляться 30 минут", points: 20, status: "not_started", completionDate: null, description: "Ходите на прогулку по 30 минут каждый день в течение 30 дней. Это поможет организму быть в тонусе.", userId: customUserId },
    { id: "11", title: "Читать книгу с блокнотом рядом", points: 10, status: "not_started", completionDate: null, description: "Читайте с блокнотом каждый день в течение 30 дней, делая записи и мысли. Это усилит понимание.", userId: customUserId },
    { id: "12", title: "Сделать растяжку 15 минут", points: 15, status: "not_started", completionDate: null, description: "Делайте растяжку по 15 минут ежедневно на протяжении 30 дней. Это улучшит гибкость и здоровье суставов.", userId: customUserId },
    { id: "13", title: "Слушать подкаст в наушниках", points: 10, status: "not_started", completionDate: null, description: "Слушайте полезные подкасты каждый день на протяжении 30 дней. Это поможет получать новые знания.", userId: customUserId },
    { id: "14", title: "Пройти 5000 шагов", points: 20, status: "not_started", completionDate: null, description: "Проходите 5000 шагов ежедневно на протяжении 30 дней. Это укрепит организм и поддержит тонус.", userId: customUserId },
    { id: "15", title: "Протереть пыль дома", points: 20, status: "not_started", completionDate: null, description: "Протирайте пыль каждый день в течение 30 дней. Это улучшит чистоту и создаст уют в доме.", userId: customUserId },
    { id: "16", title: "Сделать дыхательную гимнастику сидя", points: 15, status: "not_started", completionDate: null, description: "Выполняйте дыхательную гимнастику сидя ежедневно в течение 30 дней. Это снизит стресс и улучшит концентрацию.", userId: customUserId },
    { id: "17", title: "Поговорить с другом по видеосвязи", points: 10, status: "not_started", completionDate: null, description: "Общайтесь с другом по видеосвязи каждый день в течение 30 дней. Это улучшит настроение и укрепит отношения.", userId: customUserId },
    { id: "18", title: "Утренняя зарядка 10 минут", points: 15, status: "not_started", completionDate: null, description: "Делайте утреннюю зарядку по 10 минут ежедневно на протяжении 30 дней. Это придаст энергии на день.", userId: customUserId },
    { id: "19", title: "Выучить стихотворение вслух", points: 25, status: "not_started", completionDate: null, description: "Каждый день учите часть стихотворения вслух, чтобы за 30 дней запомнить произведение полностью.", userId: customUserId },
    { id: "20", title: "Нарисовать рисунок на бумаге", points: 15, status: "not_started", completionDate: null, description: "Рисуйте каждый день на протяжении 30 дней. Это поможет развить креативность и снять стресс.", userId: customUserId },
    { id: "21", title: "Пройти 10 000 шагов", points: 40, status: "not_started", completionDate: null, description: "Проходите по 10 000 шагов ежедневно в течение 30 дней. Это поможет держать организм в форме.", userId: customUserId },
    { id: "22", title: "Сделать 100 приседаний", points: 50, status: "not_started", completionDate: null, description: "Выполняйте по 100 приседаний ежедневно на протяжении 30 дней. Это укрепит мышцы и повысит выносливость.", userId: customUserId },
    { id: "23", title: "1 час без телефона", points: 20, status: "not_started", completionDate: null, description: "Ежедневно откладывайте телефон на 1 час в течение 30 дней. Это поможет сосредоточиться.", userId: customUserId },
    { id: "24", title: "Смотреть обучающее видео", points: 15, status: "not_started", completionDate: null, description: "Смотрите обучающее видео каждый день в течение 30 дней. Это расширит ваши знания.", userId: customUserId },
    { id: "25", title: "Сделать планку 1 минуту", points: 20, status: "not_started", completionDate: null, description: "Держите планку 1 минуту ежедневно в течение 30 дней. Это укрепит мышцы кора и спины.", userId: customUserId },
    { id: "26", title: "Сделать планку 2 минуты", points: 30, status: "not_started", completionDate: null, description: "Ежедневно держите планку 2 минуты на протяжении 30 дней. Это развивает силу и выносливость.", userId: customUserId },
    { id: "27", title: "Съесть фрукт", points: 10, status: "not_started", completionDate: null, description: "Ешьте хотя бы один фрукт каждый день в течение 30 дней. Это добавит витаминов и энергии.", userId: customUserId },
    { id: "28", title: "Погулять на свежем воздухе", points: 20, status: "not_started", completionDate: null, description: "Ежедневно выходите на прогулку на свежем воздухе в течение 30 дней. Это полезно для здоровья и психики.", userId: customUserId },
    { id: "29", title: "Прочитать 50 страниц книги", points: 30, status: "not_started", completionDate: null, description: "Читайте по 50 страниц ежедневно в течение 30 дней. Это позволит освоить новые книги.", userId: customUserId },
    { id: "30", title: "Поблагодарить 5 человек вслух", points: 20, status: "not_started", completionDate: null, description: "Выражайте благодарность 5 людям ежедневно в течение 30 дней. Это поднимет настроение и укрепит отношения.", userId: customUserId },
    { id: "31", title: "Смотреть документальный фильм", points: 25, status: "not_started", completionDate: null, description: "Смотрите документальные фильмы каждый день в течение 30 дней. Это расширит кругозор.", userId: customUserId },
    { id: "32", title: "Сделать растяжку 5 минут", points: 10, status: "not_started", completionDate: null, description: "Делайте растяжку по 5 минут каждый день в течение 30 дней. Это улучшит гибкость и самочувствие.", userId: customUserId },
    { id: "33", title: "Тренироваться 40 минут", points: 40, status: "not_started", completionDate: null, description: "Занимайтесь тренировкой по 40 минут каждый день в течение 30 дней. Это укрепит организм и даст энергию.", userId: customUserId },
    { id: "34", title: "Выучить 20 английских слов", points: 40, status: "not_started", completionDate: null, description: "Учите по 20 английских слов каждый день на протяжении 30 дней. Это значительно расширит словарный запас.", userId: customUserId },
    { id: "35", title: "Лечь спать до 23:00", points: 25, status: "not_started", completionDate: null, description: "Ложитесь спать до 23:00 каждый день в течение 30 дней. Это улучшит режим сна.", userId: customUserId },
    { id: "36", title: "Проснуться рано без будильника", points: 20, status: "not_started", completionDate: null, description: "Старайтесь просыпаться рано без будильника каждый день в течение 30 дней. Это наладит биоритмы.", userId: customUserId },
    { id: "37", title: "Сделать 200 прыжков на скакалке", points: 30, status: "not_started", completionDate: null, description: "Ежедневно делайте по 200 прыжков на скакалке в течение 30 дней. Это поможет сжечь калории и развить выносливость.", userId: customUserId },
    { id: "38", title: "Работать 2 часа за компьютером без отвлечений", points: 50, status: "not_started", completionDate: null, description: "Ежедневно работайте 2 часа за компьютером без отвлечений в течение 30 дней. Это улучшит концентрацию.", userId: customUserId },
    { id: "39", title: "Сделать уборку стола", points: 15, status: "not_started", completionDate: null, description: "Наводите порядок на столе каждый день в течение 30 дней. Это поможет сохранять организованность.", userId: customUserId },
    { id: "40", title: "Попробовать новое блюдо", points: 20, status: "not_started", completionDate: null, description: "Пробуйте новое блюдо каждый день в течение 30 дней. Это разнообразит рацион и сделает питание интересным.", userId: customUserId },
    { id: "41", title: "Сходить в библиотеку", points: 15, status: "not_started", completionDate: null, description: "Посещайте библиотеку или берите книги каждый день в течение 30 дней. Это создаст привычку читать.", userId: customUserId },
    { id: "42", title: "Сделать 30 приседаний", points: 15, status: "not_started", completionDate: null, description: "Выполняйте 30 приседаний каждый день в течение 30 дней. Это укрепит мышцы ног.", userId: customUserId },
    { id: "43", title: "Играть на музыкальном инструменте 15 минут", points: 20, status: "not_started", completionDate: null, description: "Играйте на музыкальном инструменте каждый день по 15 минут в течение 30 дней. Это улучшит музыкальные навыки.", userId: customUserId },
    { id: "44", title: "Сделать дыхательные упражнения стоя", points: 10, status: "not_started", completionDate: null, description: "Ежедневно выполняйте дыхательные упражнения стоя в течение 30 дней. Это улучшит здоровье дыхательной системы.", userId: customUserId },
    { id: "45", title: "2 часа без телефона", points: 30, status: "not_started", completionDate: null, description: "Откладывайте телефон на 2 часа каждый день в течение 30 дней. Это освободит время для важных дел.", userId: customUserId },
    { id: "46", title: "Пробежать 3 км", points: 30, status: "not_started", completionDate: null, description: "Бегайте по 3 км ежедневно в течение 30 дней. Это поможет развить выносливость и здоровье.", userId: customUserId },
    { id: "47", title: "Прочитать статью о саморазвитии", points: 10, status: "not_started", completionDate: null, description: "Читайте статьи о саморазвитии каждый день в течение 30 дней. Это поможет стать лучше.", userId: customUserId },
    { id: "48", title: "Составить план на месяц", points: 50, status: "not_started", completionDate: null, description: "Ежедневно составляйте и корректируйте план на месяц в течение 30 дней. Это улучшит продуктивность.", userId: customUserId },
    { id: "49", title: "Сделать 15 минут йоги", points: 20, status: "not_started", completionDate: null, description: "Занимайтесь йогой по 15 минут ежедневно на протяжении 30 дней. Это укрепит тело и ум.", userId: customUserId },
    { id: "50", title: "Приготовить здоровый завтрак", points: 25, status: "not_started", completionDate: null, description: "Готовьте здоровый завтрак каждый день в течение 30 дней. Это придаст энергии и улучшит самочувствие.", userId: customUserId }
  ];

  try {
    const existingGoals = await getAllGoals(customUserId);
    if (existingGoals.length === goalsArray.length) {
      console.log(`У пользователя ${customUserId} уже есть все ${existingGoals.length} целей. Пропускаем инициализацию.`);
      return false;
    }

    console.log(`У пользователя ${customUserId} найдено ${existingGoals.length} целей. Инициализируем все цели...`);
    const response = await axios.post(`${BASE_URL}/initialize-goals/${customUserId}`, { goalsArray });
    return true;
  } catch (error) {
    console.error("Ошибка инициализации целей:", error);
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

export async function getGeneraleText(goalsDone, goalsInProgress) {
  const goals = [...goalsDone, ...goalsInProgress];
  const res = await axios.post(`${BASE_URL}/generate-report`, {
    goals,
  });
  if (res.data?.success) {
    return (res.data.message);
  } else {
    return "Сервер вернул пустой результат";
  }
}

export async function initializeAchievements(userId) {

  const achievements = [
    {
      "id": 1,
      "title": "30 дней бега",
      "description": "Вы пробегали по 1 км каждый день в течение 30 дней. Это доказательство вашей дисциплины и силы духа.",
      "requirement": "Пробегать минимум 1 км ежедневно на протяжении 30 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/8589MTrk/2025-09-10-17-24-46-no-bg-preview-carve-photos.png",
      "points": 100
    },
    {
      "id": 2,
      "title": "Пятёрка выносливости",
      "description": "Вы пробегали по 5 км в течение 30 дней. Ваша настойчивость заслуживает уважения.",
      "requirement": "Пробегать минимум 5 км ежедневно на протяжении 30 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/9Q6JNJXJ/2025-09-10-17-25-10-no-bg-preview-carve-photos.png",
      "points": 250
    },
    {
      "id": 3,
      "title": "Книжный марафон",
      "description": "Вы каждый день в течение 30 дней читали книги. Эти знания делают вас сильнее и мудрее.",
      "requirement": "Читать минимум 15 страниц ежедневно на протяжении 30 дней.",
      "status": "earned",
      "image": "https://i.postimg.cc/50n5131c/2025-09-10-17-24-51-no-bg-preview-carve-photos.png",
      "points": 150
    },
    {
      "id": 4,
      "title": "Здоровый рацион",
      "description": "Вы придерживались здорового питания 30 дней подряд. Ваше тело скажет вам спасибо!",
      "requirement": "Следовать принципам здорового питания ежедневно на протяжении 30 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/qBFnLgvG/2025-09-10-17-25-30-no-bg-preview-carve-photos.png",
      "points": 200
    },
    {
      "id": 5,
      "title": "Ледяная закалка",
      "description": "Вы закалялись 30 дней подряд. Ваша сила воли закалена, как сталь!",
      "requirement": "Практиковать закаливание (например, холодный душ) ежедневно на протяжении 30 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/BZP5R2yz/2025-09-10-17-25-05-no-bg-preview-carve-photos.png",
      "points": 150
    },
    {
      "id": 6,
      "title": "Кодерский марафон",
      "description": "Вы кодили по 2 часа каждый день в течение 30 дней. Ваш код — это искусство!",
      "requirement": "Заниматься программированием минимум 2 часа ежедневно на протяжении 30 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/Zn2FWxRW/2025-09-10-17-24-55-no-bg-preview-carve-photos.png",
      "points": 300
    },
    {
      "id": 7,
      "title": "Полгода прогресса",
      "description": "Вы стабильно двигались к своим целям в течение полугода. Это настоящий прорыв!",
      "requirement": "Соблюдать дисциплину в любых активностях приложения в течение 180 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/BnbnwB7L/2025-09-10-17-25-39-no-bg-preview-carve-photos.png",
      "points": 500
    },
    {
      "id": 8,
      "title": "Сила отжиманий",
      "description": "Вы отжимались по 20 раз каждый день в течение 30 дней. Ваши мышцы — это мощь!",
      "requirement": "Выполнять минимум 20 отжиманий ежедневно на протяжении 30 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/rsq8G1tp/2025-09-10-17-25-21-no-bg-preview-carve-photos.png",
      "points": 150
    },
    {
      "id": 9,
      "title": "Ранний старт",
      "description": "Вы вставали не позже 6 утра 30 дней подряд. Ваш день начинается с победы!",
      "requirement": "Вставать не позже 6:00 утра ежедневно на протяжении 30 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/MTSxx75Y/2025-09-10-17-25-45-no-bg-preview-carve-photos.png",
      "points": 200
    },
    {
      "id": 10,
      "title": "Великий дисциплинатор",
      "description": "Вы пользовались приложением и соблюдали дисциплину целый год. Вы — легенда!",
      "requirement": "Использовать приложение и выполнять задачи дисциплины ежедневно в течение 365 дней.",
      "status": "locked",
      "image": "https://i.postimg.cc/gJXRFPMh/2025-09-10-17-25-26-no-bg-preview-carve-photos.png",
      "points": 1000
    },
    {
      "id": 11,
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