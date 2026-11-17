// Единый согласованный каталог. Его используют и клиентская инициализация,
// и серверные операции синхронизации, чтобы старый список не возвращался.
export const ACHIEVEMENT_TEMPLATES = [
  { id: '1', title: 'Красавчик!', description: 'Вы начали пользоваться приложением и сделали первый шаг к своим целям.', requirement: 'Начать пользоваться приложением.', status: 'my', image: '/Image/achievements/achievement-1.webp', gif: '', points: 0, rarity: 'common', type: 'event_based', goalIds: [], target: null },
  { id: '2', title: 'В игре', description: 'Вы прошли обучение и познакомились с приложением.', requirement: 'Пройти обучение.', status: 'locked', image: '/Image/achievements/achievement-27.webp', gif: '', points: 0, rarity: 'common', type: 'event_based', goalIds: [], target: null },
  { id: '3', title: '30 дней бега', description: 'Вы возвращались к бегу и укрепляли привычку.', requirement: 'Выполнить цель «Бегать» 30 раз.', status: 'locked', image: '/Image/achievements/achievement-2.webp', gif: '', points: 0, rarity: 'common', type: 'goal_based', goalIds: ['1', '3'], target: 30 },
  { id: '4', title: 'Книжный марафон', description: 'Регулярное чтение стало частью вашего дня.', requirement: 'Выполнить цель «Читать книгу» 30 раз.', status: 'locked', image: '/Image/achievements/achievement-3.webp', gif: '', points: 0, rarity: 'common', type: 'goal_based', goalIds: ['2'], target: 30 },
  { id: '5', title: 'Кодерский марафон', description: 'Вы регулярно уделяли время программированию.', requirement: 'Выполнить цель «Программировать» 30 раз.', status: 'locked', image: '/Image/achievements/achievement-4.webp', gif: '', points: 0, rarity: 'common', type: 'goal_based', goalIds: ['4'], target: 30 },
  { id: '6', title: 'Гибкость начинается', description: 'Небольшие занятия растяжкой складываются в привычку.', requirement: 'Выполнить цель «Сделать растяжку после сна» 45 раз.', status: 'locked', image: '/Image/achievements/achievement-32.webp', gif: '', points: 0, rarity: 'common', type: 'goal_based', goalIds: ['61', '65'], target: 45 },
  { id: '7', title: 'Утро в движении', description: 'Вы начали утро с зарядки.', requirement: 'Выполнить цель «Утренняя зарядка» 30 раз.', status: 'locked', image: '/Image/achievements/achievement-33-v2.webp', gif: '', points: 0, rarity: 'common', type: 'goal_based', goalIds: ['18'], target: 30 },
  { id: '8', title: 'Шаг за шагом', description: 'Вы находили время для прогулок на свежем воздухе.', requirement: 'Выполнить цель «Погулять на свежем воздухе» 30 раз.', status: 'locked', image: '/Image/achievements/achievement-34.webp', gif: '', points: 0, rarity: 'common', type: 'goal_based', goalIds: ['63'], target: 30 },
  { id: '9', title: 'Прыжок к цели', description: 'Вы выполнили много прыжков на скакалке.', requirement: 'Выполнить цель «Прыгать на скакалке» 45 раз.', status: 'locked', image: '/Image/achievements/achievement-35.webp', gif: '', points: 0, rarity: 'common', type: 'goal_based', goalIds: ['62'], target: 45 },
  { id: '10', title: 'Здоровый рацион', description: 'Вы придерживались выбранного рациона и обходились без сладкого.', requirement: 'Выполнить цель «Провести день без сладостей» 90 раз.', status: 'locked', image: '/Image/achievements/rare-10-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['68'], target: 90 },
  { id: '11', title: 'Ранний старт', description: 'Вы закрепили привычку вставать в запланированное время.', requirement: 'Выполнить цель «Встать в запланированное время» 90 раз.', status: 'locked', image: '/Image/achievements/rare-11-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['36'], target: 90 },
  { id: '12', title: 'Ледяная закалка', description: 'Вы регулярно практиковали закаливание.', requirement: 'Выполнить цель «Облиться холодной водой» 90 раз.', status: 'locked', image: '/Image/achievements/rare-12-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['16'], target: 90 },
  { id: '13', title: 'Сила отжиманий', description: 'Вы выстроили регулярную привычку к упражнениям.', requirement: 'Выполнить цель «Отжиматься» 90 раз.', status: 'locked', image: '/Image/achievements/rare-13-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['8'], target: 90 },
  { id: '14', title: 'Голос души', description: 'Вы регулярно занимались пением.', requirement: 'Выполнить цель «Заниматься пением» 90 раз.', status: 'locked', image: '/Image/achievements/rare-14-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['182'], target: 90 },
  { id: '15', title: 'Танцевальный ритм', description: 'Вы находили время для танцев и движения.', requirement: 'Выполнить цель «Танцевать» 90 раз.', status: 'locked', image: '/Image/achievements/rare-15-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['184'], target: 90 },
  { id: '16', title: 'Финансовый порядок', description: 'Вы последовательно записывали ежедневные расходы.', requirement: 'Выполнить цель «Записать расходы за день» 90 раз.', status: 'locked', image: '/Image/achievements/rare-16-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['185'], target: 90 },
  { id: '17', title: 'Чистое рабочее место', description: 'Вы поддерживали порядок на рабочем месте.', requirement: 'Выполнить цель «Убрать рабочее место» 90 раз.', status: 'locked', image: '/Image/achievements/rare-17-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['66'], target: 90 },
  { id: '18', title: 'Без телефона', description: 'Вы регулярно откладывали телефон и сосредотачивались на своих делах.', requirement: 'Выполнить цель «Провести время без телефона» 90 раз.', status: 'locked', image: '/Image/achievements/rare-18-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['45'], target: 90 },
  { id: '19', title: 'Поделиться прогрессом', description: 'Вы делились своими результатами и поддерживали свой темп.', requirement: 'Выполнить цель «Поделиться своим отчётом» 90 раз.', status: 'locked', image: '/Image/achievements/rare-19-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['183'], target: 90 },
  { id: '20', title: 'Языковой прогресс', description: 'Вы регулярно изучали иностранный язык.', requirement: 'Выполнить цель «Практиковать иностранный язык» 90 раз.', status: 'locked', image: '/Image/achievements/rare-20-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['167'], target: 90 },
  { id: '21', title: 'Дневник мыслей', description: 'Вы регулярно подводили итоги дня и записывали свои мысли.', requirement: 'Выполнить цель «Записать итоги дня» 90 раз.', status: 'locked', image: '/Image/achievements/rare-21-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'goal_based', goalIds: ['160'], target: 90 },
  { id: '22', title: 'На новом уровне', description: 'Вы достигли 25-го уровня.', requirement: 'Достичь 25-го уровня.', status: 'locked', image: '/Image/achievements/rare-22-v1.webp', gif: '', points: 0, rarity: 'rare', type: 'level_based', goalIds: [], target: 25 },
  { id: '23', title: 'Серия года', description: 'Год регулярной работы над собой — большой результат.', requirement: 'Пользоваться приложением 365 дней.', status: 'locked', image: '/Image/achievements/legendary-23-v1.webp', gif: '', points: 0, rarity: 'legendary', type: 'time_based', goalIds: [], target: 365 },
  { id: '24', title: 'Создатель системы', description: 'Вы достигли 100 уровня благодаря постоянному прогрессу.', requirement: 'Достичь 100 уровня.', status: 'locked', image: '/Image/achievements/legendary-24-v1.webp', gif: '', points: 0, rarity: 'legendary', type: 'level_based', goalIds: [], target: 100 },
  { id: '25', title: 'Тысяча выполнений', description: 'Тысяча завершённых целей — внушительный путь.', requirement: 'Выполнить любые цели суммарно 1000 раз.', status: 'locked', image: '/Image/achievements/legendary-25-v1.webp', gif: '', points: 0, rarity: 'legendary', type: 'completion_count_based', goalIds: [], target: 1000 },
  { id: '26', title: 'Коллекционер', description: 'Вы собрали все достижения, кроме эпических.', requirement: 'Получить все ачивки, кроме эпических.', status: 'locked', image: '/Image/achievements/legendary-26-v1.webp', gif: '', points: 0, rarity: 'legendary', type: 'collection_based', goalIds: [], target: null },
  { id: '27', title: 'Один из первых', description: 'Эту ачивку получили первые 100 пользователей бота.', requirement: 'Попасть в первые 100 пользователей бота.', status: 'my', image: '/Image/achievements/epic-27-v1.webp', gif: '', points: 0, rarity: 'epic', type: 'event_based', goalIds: [], target: null },
  { id: '28', title: 'Месяц огонька', description: 'Вы поддерживали серию выполнения целей 30 дней подряд.', requirement: 'Поддерживать серию огонька 30 дней подряд.', status: 'locked', image: '/Image/achievements/streak-30.webp', gif: '', points: 0, rarity: 'common', type: 'streak_based', goalIds: [], target: 30 },
  { id: '29', title: 'Неугасимая серия', description: 'Вы поддерживали серию выполнения целей 100 дней подряд.', requirement: 'Поддерживать серию огонька 100 дней подряд.', status: 'locked', image: '/Image/achievements/streak-100.webp', gif: '', points: 0, rarity: 'rare', type: 'streak_based', goalIds: [], target: 100 },
  { id: '30', title: 'Пламя года', description: 'Вы поддерживали серию выполнения целей 365 дней подряд.', requirement: 'Поддерживать серию огонька 365 дней подряд.', status: 'locked', image: '/Image/achievements/streak-365.webp', gif: '', points: 0, rarity: 'legendary', type: 'streak_based', goalIds: [], target: 365 },
];

export function validateAchievementTemplates(templates = ACHIEVEMENT_TEMPLATES) {
  const ids = new Set();
  const goalIds = new Set();
  for (const achievement of templates) {
    if (!achievement.id || ids.has(String(achievement.id))) throw new Error(`Duplicate or missing achievement id: ${achievement.id}`);
    ids.add(String(achievement.id));
    if (!achievement.title || !achievement.description || !achievement.requirement || !achievement.image) {
      throw new Error(`Incomplete achievement template: ${achievement.title || achievement.id}`);
    }
    if (achievement.type === 'goal_based') {
      for (const goalId of achievement.goalIds || []) {
        if (goalIds.has(String(goalId))) throw new Error(`Goal ${goalId} is assigned to multiple achievements`);
        goalIds.add(String(goalId));
      }
      if (!achievement.goalIds?.length || !Number(achievement.target)) throw new Error(`Invalid goal-based achievement: ${achievement.title}`);
    }
  }
  return true;
}

validateAchievementTemplates();
