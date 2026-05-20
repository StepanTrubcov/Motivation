import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { goalsTranslations } from '@/utils/goalsTranslations';

function create120DaysGoals(initialGoalData, numberOfDays = 120, selectedOption = null) {
  const goals = [];
  const today = new Date();
  const daysToCreate = numberOfDays;

  for (let i = 0; i < daysToCreate; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    let goalData = [];
    if (initialGoalData && selectedOption !== null && selectedOption !== undefined) {
      if (i < selectedOption) {
        goalData = [initialGoalData];
      }
    } else if (initialGoalData) {
      goalData = [initialGoalData];
    }

    const goalObject = {
      date: date.toISOString().split('T')[0],
      goalData: goalData
    };

    goals.push(goalObject);
  }

  return goals;
}

function updateGoalsFromDate(goals, targetDate, newGoalData, selectedOption = null) {
  if (selectedOption !== null && selectedOption !== undefined) {
    const targetDateObj = new Date(targetDate);
    const endDateObj = new Date(targetDateObj);
    endDateObj.setDate(targetDateObj.getDate() + selectedOption);

    return goals.map(goal => {
      const goalDateObj = new Date(goal.date);

      if (goalDateObj >= targetDateObj && goalDateObj < endDateObj) {
        const isDuplicate = goal.goalData.some(data =>
          JSON.stringify(data) === JSON.stringify(newGoalData)
        );

        if (!isDuplicate) {
          return {
            ...goal,
            goalData: [...goal.goalData, newGoalData]
          };
        }
      }

      return goal;
    });
  } else {
    return goals.map(goal => {
      if (goal.date >= targetDate) {
        const isDuplicate = goal.goalData.some(data =>
          JSON.stringify(data) === JSON.stringify(newGoalData)
        );

        if (!isDuplicate) {
          goal.goalData.push(newGoalData);
        }
      }

      return goal;
    });
  }
}

function removeGoalFromDate(goals, startDate, goalId) {
  return goals.map(goal => {
    if (goal.date >= startDate) {
      const filteredGoalData = goal.goalData.filter(data => data.idGoals !== goalId);
      return {
        ...goal,
        goalData: filteredGoalData
      };
    }
    return goal;
  });
}

function removeGoalFromToday(goals, goalId) {
  const today = new Date().toISOString().split('T')[0];
  return removeGoalFromDate(goals, today, goalId);
}

function getLastDateInSavingGoals(savingGoals) {
  if (!Array.isArray(savingGoals) || savingGoals.length === 0) return null;
  let lastDate = null;
  for (const day of savingGoals) {
    if (!day?.date) continue;
    if (!lastDate || day.date > lastDate) lastDate = day.date;
  }
  return lastDate;
}

/** Цели с последнего дня, где goalData не пустой (копируются как есть на новые дни). */
function getGoalsTemplateFromSavingGoals(savingGoals) {
  if (!Array.isArray(savingGoals) || savingGoals.length === 0) return [];

  const sorted = [...savingGoals].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = sorted.length - 1; i >= 0; i--) {
    const dayGoals = sorted[i]?.goalData;
    if (!Array.isArray(dayGoals) || dayGoals.length === 0) continue;

    const seen = new Set();
    return dayGoals
      .filter((g) => {
        if (!g?.idGoals || seen.has(g.idGoals)) return false;
        seen.add(g.idGoals);
        return true;
      })
      .map((g) => ({ ...g }));
  }

  return [];
}

function resetSavingGoalsStatuses(savingGoals) {
  if (!Array.isArray(savingGoals)) return [];

  return savingGoals.map((day) => ({
    ...day,
    goalData: (day.goalData || []).map((g) => ({
      ...g,
      status: 'not_started',
    })),
  }));
}

/** Дописывает numberOfDays дней сразу после последней даты, историю не трогает. */
function appendDaysWithGoalTemplate(existingGoals, templateGoalData, numberOfDays = 120) {
  const base = Array.isArray(existingGoals) ? existingGoals : [];
  const lastDateStr = getLastDateInSavingGoals(base);

  const start = lastDateStr
    ? new Date(`${lastDateStr}T12:00:00`)
    : new Date();
  if (lastDateStr) {
    start.setDate(start.getDate() + 1);
  }

  const appended = [];
  for (let i = 0; i < numberOfDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    appended.push({
      date: date.toISOString().split('T')[0],
      goalData: templateGoalData.map((g) => ({ ...g })),
    });
  }

  return [...base, ...appended];
}

const SAVING_GOALS_APPEND_DAYS = 120;

async function extendSavingGoalsForUser(user) {
  const oldGoals = Array.isArray(user.savingGoals) ? user.savingGoals : [];
  const template = getGoalsTemplateFromSavingGoals(oldGoals);
  const updatedGoals = appendDaysWithGoalTemplate(oldGoals, template, SAVING_GOALS_APPEND_DAYS);

  return prisma.user.update({
    where: { id: user.id },
    data: { savingGoals: updatedGoals },
    select: {
      id: true,
      telegramId: true,
      savingGoals: true,
    },
  });
}

async function resetSavingGoalsStatusesForUser(user) {
  const oldGoals = Array.isArray(user.savingGoals) ? user.savingGoals : [];
  const updatedGoals = resetSavingGoalsStatuses(oldGoals);

  await prisma.goal.updateMany({
    where: { userId: user.id },
    data: {
      status: 'not_started',
      selectedOption: 0,
      startDate: null,
      completionDate: null,
      progress: 0,
    },
  });

  return prisma.user.update({
    where: { id: user.id },
    data: { savingGoals: updatedGoals },
    select: {
      id: true,
      telegramId: true,
      savingGoals: true,
    },
  });
}

export async function POST(request) {
  // Получаем параметры из URL
  const url = new URL(request.url);
  const clearAll = url.searchParams.get('clearAll');
  const removeToday = url.searchParams.get('removeToday');
  const generateReport = url.searchParams.get('generateReport');
  const extend = url.searchParams.get('extend');
  const resetStatuses = url.searchParams.get('resetStatuses');

  if (extend === 'true') {
    try {
      const { userId } = await request.json();

      if (!userId) {
        return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { telegramId: userId },
      });

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const updatedUser = await extendSavingGoalsForUser(user);

      return NextResponse.json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Ошибка при продлении savingGoals:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  if (resetStatuses === 'true') {
    try {
      const { userId } = await request.json();

      if (!userId) {
        return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { telegramId: userId },
      });

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const updatedUser = await resetSavingGoalsStatusesForUser(user);

      return NextResponse.json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Ошибка при сбросе статусов savingGoals:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  if (removeToday === 'true') {
    try {
      const { userId, goalId, numberOfDays } = await request.json();

      console.log('=== НАЧАЛО УДАЛЕНИЯ ЦЕЛИ С СЕГОДНЯШНЕЙ ДАТЫ ===');
      console.log('Полученные параметры:', { userId, goalId });

      const user = await prisma.user.findUnique({
        where: { telegramId: userId }
      });

      if (!user) {
        console.log('Пользователь не найден:', userId);
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      console.log('Найден пользователь:', user.id);
      console.log('Текущие savingGoals:', JSON.stringify(user.savingGoals, null, 2));

      const updatedSavingGoals = removeGoalFromToday(user.savingGoals, goalId);

      console.log('Обновленные savingGoals:', JSON.stringify(updatedSavingGoals, null, 2));

      // Обновляем пользователя с новыми savingGoals
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          savingGoals: updatedSavingGoals
        },
        select: {
          id: true,
          telegramId: true,
          savingGoals: true
        }
      });

      console.log('Пользователь успешно обновлен:', updatedUser);
      console.log('=== КОНЕЦ УДАЛЕНИЯ ЦЕЛИ С СЕГОДНЯШНЕЙ ДАТЫ ===');

      return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Ошибка при удалении цели с сегодняшней даты:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  if (clearAll === 'true') {
    try {
      const { userId } = await request.json();

      if (!userId) {
        return NextResponse.json({
          success: false,
          error: 'userId is required'
        }, { status: 400 });
      }

      console.log(`Очистка всех целей для пользователя ${userId}`);

      // Ищем пользователя по telegramId
      const user = await prisma.user.findUnique({
        where: { telegramId: userId }
      });

      if (!user) {
        console.log('Пользователь не найден:', userId);
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      console.log('Найден пользователь:', user.id);

      // Очищаем массив savingGoals
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          savingGoals: []
        },
        select: {
          id: true,
          telegramId: true,
          savingGoals: true
        }
      });

      console.log('Массив savingGoals успешно очищен для пользователя:', updatedUser);

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Все цели успешно очищены'
      });
    } catch (error) {
      console.error('Ошибка при очистке всех целей:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
  }

  if (generateReport === 'true') {
    try {
      const { userId, period, goalsArray } = await request.json();

      if (!userId || !period || !goalsArray) {
        return NextResponse.json({
          success: false,
          error: 'userId, period, and goalsArray are required'
        }, { status: 400 });
      }

      // Проверяем, что period является одним из допустимых значений
      const validPeriods = [4, 5, 7, 30, 60, 120];
      if (!validPeriods.includes(period)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid period. Must be one of: 2, 5, 7, 30, 60, 120'
        }, { status: 400 });
      }

      console.log(`Генерация отчета для пользователя ${userId} за последние ${period} дней`);

      // Получаем данные пользователя
      const user = await prisma.user.findUnique({
        where: { telegramId: userId },
        select: {
          id: true,
          telegramId: true,
          language: true,
          firstName: true,
          username: true,
          savingGoals: true
        }
      });

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      const lang = user?.language === 'ang' ? 'en' : 'ru'; // DB: rus/ang -> UI: ru/en
      const translations = goalsTranslations[lang] || goalsTranslations.ru;

      // Переводим goalsArray только для стандартных целей по числовому суффиксу id.
      const goalsArrayTranslated = lang === 'en'
        ? (Array.isArray(goalsArray) ? goalsArray.map((g) => {
          const m = String(g?.id ?? '').match(/(\d+)$/);
          const goalIdSuffix = m?.[1];
          const tr = goalIdSuffix ? translations?.[goalIdSuffix] : null;
          if (!tr) return g;
          return {
            ...g,
            title: tr.title ?? g.title,
            description: tr.description ?? g.description,
          };
        }) : goalsArray)
        : goalsArray;

      // Анализируем цели и генерируем отчет
      // Для новой структуры данных мы передаем goalsArray напрямую, а не user.savingGoals
      const reportData = analyzeGoalsForPeriod([], goalsArrayTranslated, period);

      // Генерируем текстовый отчет
      const reportText = generateReportText(reportData, user, period, lang);

      return NextResponse.json({
        success: true,
        reportData,
        reportText
      });
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
  }



  // Существующая логика для POST запроса
  try {
    const { userId, goalData, targetDate, numberOfDays, selectedOption } = await request.json();

    const user = await prisma.user.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    let updatedGoals;

    if (!user.savingGoals || user.savingGoals.length === 0) {
      // Создаем 120 дней с пустыми массивами goalData
      updatedGoals = create120DaysGoals(goalData, numberOfDays, selectedOption);
    } else {
      // Обновляем существующие цели, используя selectedOption если он указан
      const targetDateToUse = targetDate || new Date().toISOString().split('T')[0];
      updatedGoals = updateGoalsFromDate(user.savingGoals, targetDateToUse, goalData, selectedOption);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        savingGoals: updatedGoals
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });

    // Возвращаем объекты напрямую, без дополнительного парсинга
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Ошибка при добавлении цели:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const filterByDays = searchParams.get('filterByDays');
    const autoPeriod = searchParams.get('autoPeriod'); // Новый параметр для автоматического периода

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
      select: { savingGoals: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    let savingGoals = Array.isArray(user.savingGoals) ? user.savingGoals : [];

    // Если передан параметр autoPeriod, автоматически определяем период
    if (autoPeriod === 'true') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Находим индекс сегодняшней даты в массиве
      const todayIndex = savingGoals.findIndex(goal => goal.date === todayStr);

      // Определяем, сколько дней прошло от начала массива
      let daysPassed;
      if (todayIndex !== -1) {
        daysPassed = todayIndex + 1; // +1 потому что индекс начинается с 0
      } else {
        // Если сегодняшняя дата не найдена, берем длину массива
        daysPassed = savingGoals.length;
      }

      // Определяем период (30, 60 или 120 дней)
      let period;
      if (daysPassed >= 120) {
        period = 120;
      } else if (daysPassed >= 60) {
        period = 60;
      } else if (daysPassed >= 30) {
        period = 30;
      } else {
        period = daysPassed; // Если прошло меньше 30 дней, берем столько, сколько прошло
      }

      // Фильтруем массив по периоду
      if (todayIndex !== -1) {
        // Вычисляем начальный индекс
        const startIndex = Math.max(0, todayIndex - period + 1);
        // Берем элементы от startIndex до todayIndex включительно
        savingGoals = savingGoals.slice(startIndex, todayIndex + 1);
      } else {
        // Если сегодняшняя дата не найдена, берем последние N элементов
        if (savingGoals.length > period) {
          savingGoals = savingGoals.slice(-period);
        }
      }

      return NextResponse.json({
        success: true,
        savingGoals: savingGoals,
        period: period,
        daysPassed: daysPassed
      });
    }
    else if (filterByDays) {
      const days = parseInt(filterByDays);
      if ([30, 60, 120].includes(days)) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const todayIndex = savingGoals.findIndex(goal => goal.date === todayStr);

        if (todayIndex !== -1) {
          const startIndex = Math.max(0, todayIndex - days + 1);
          savingGoals = savingGoals.slice(startIndex, todayIndex + 1);
        } else {
          if (savingGoals.length > days) {
            savingGoals = savingGoals.slice(-days);
          }
        }
      }
    }

    return NextResponse.json({ success: true, savingGoals });
  } catch (error) {
    console.error('Ошибка при получении целей:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET_PERIOD(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
      select: { savingGoals: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const savingGoals = user.savingGoals;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Находим индекс сегодняшней даты в массиве
    const todayIndex = savingGoals.findIndex(goal => goal.date === todayStr);

    // Определяем, сколько дней прошло от начала массива
    let daysPassed;
    if (todayIndex !== -1) {
      daysPassed = todayIndex + 1; // +1 потому что индекс начинается с 0
    } else {
      // Если сегодняшняя дата не найдена, берем длину массива
      daysPassed = savingGoals.length;
    }

    // Определяем период (30, 60 или 120 дней)
    let period;
    if (daysPassed >= 120) {
      period = 120;
    } else if (daysPassed >= 60) {
      period = 60;
    } else if (daysPassed >= 30) {
      period = 30;
    } else {
      period = daysPassed; // Если прошло меньше 30 дней, берем столько, сколько прошло
    }

    // Фильтруем массив по периоду
    let filteredGoals;
    if (todayIndex !== -1) {
      // Вычисляем начальный индекс
      const startIndex = Math.max(0, todayIndex - period + 1);
      // Берем элементы от startIndex до todayIndex включительно
      filteredGoals = savingGoals.slice(startIndex, todayIndex + 1);
    } else {
      // Если сегодняшняя дата не найдена, берем последние N элементов
      if (savingGoals.length > period) {
        filteredGoals = savingGoals.slice(-period);
      } else {
        filteredGoals = savingGoals;
      }
    }

    return NextResponse.json({
      success: true,
      savingGoals: filteredGoals,
      period: period,
      daysPassed: daysPassed
    });
  } catch (error) {
    console.error('Ошибка при получении целей по периоду:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const url = new URL(request.url);
    const updateType = url.searchParams.get('type');

    // Если это обновление статуса цели
    if (updateType === 'updateGoalStatus') {
      const { userId, date, goalId, newStatus } = await request.json();

      console.log('=== НАЧАЛО ОБНОВЛЕНИЯ СТАТУСА ===');
      console.log('Полученные параметры:', { userId, date, goalId, newStatus });

      // Ищем пользователя по telegramId
      const user = await prisma.user.findUnique({
        where: { telegramId: userId }
      });

      if (!user) {
        console.log('Пользователь не найден:', userId);
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      console.log('Найден пользователь:', user.id);
      console.log('Текущие savingGoals:', JSON.stringify(user.savingGoals, null, 2));

      // Сначала по дате ищется нужный день
      const dayIndex = user.savingGoals.findIndex(goal => goal.date === date);

      console.log('Индекс дня по дате:', dayIndex);
      console.log('Искомая дата:', date);

      if (dayIndex === -1) {
        console.log('День не найден для даты:', date);
        return NextResponse.json({
          success: false,
          error: `Day with date ${date} not found in saving goals`
        }, { status: 404 });
      }

      // Затем в goalData по id цели ищется нужная цель
      console.log('GoalData для найденного дня:', user.savingGoals[dayIndex].goalData);
      const goalItemIndex = user.savingGoals[dayIndex].goalData.findIndex(item => item.idGoals === goalId);

      console.log('Индекс цели по id:', goalItemIndex);
      console.log('Искомый id цели:', goalId);

      if (goalItemIndex === -1) {
        console.log('Цель не найдена для id:', goalId);
        return NextResponse.json({
          success: false,
          error: `Goal with id ${goalId} not found for date ${date}`
        }, { status: 404 });
      }

      // Создаем копию массива savingGoals для обновления
      const updatedSavingGoals = [...user.savingGoals];

      // Создаем копию объекта дня
      const updatedDay = { ...updatedSavingGoals[dayIndex] };

      // Создаем копию массива goalData
      const updatedGoalData = [...updatedDay.goalData];

      // Обновляем статус конкретной цели только в этот день
      console.log('Старый статус цели:', updatedGoalData[goalItemIndex].status);
      updatedGoalData[goalItemIndex] = {
        ...updatedGoalData[goalItemIndex],
        status: newStatus
      };
      console.log('Новый статус цели:', updatedGoalData[goalItemIndex].status);

      // Обновляем goalData в объекте дня
      updatedDay.goalData = updatedGoalData;

      // Обновляем день в массиве savingGoals
      updatedSavingGoals[dayIndex] = updatedDay;

      console.log('Обновленные savingGoals:', JSON.stringify(updatedSavingGoals, null, 2));

      // Обновляем пользователя с новыми savingGoals
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          savingGoals: updatedSavingGoals
        },
        select: {
          id: true,
          telegramId: true,
          savingGoals: true
        }
      });

      console.log('Пользователь успешно обновлен:', updatedUser);
      console.log('=== КОНЕЦ ОБНОВЛЕНИЯ СТАТУСА ===');

      return NextResponse.json({ success: true, user: updatedUser });
    } else {
      // Существующая логика для обновления всего массива
      const { userId, goalsArray } = await request.json();

      const user = await prisma.user.findUnique({
        where: { telegramId: userId }
      });

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          savingGoals: goalsArray
        },
        select: {
          id: true,
          telegramId: true,
          savingGoals: true
        }
      });

      return NextResponse.json({ success: true, user: updatedUser });
    }
  } catch (error) {
    console.error('Ошибка при обновлении целей:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const index = parseInt(searchParams.get('index'));

    if (!userId || isNaN(index)) {
      return NextResponse.json({ success: false, error: 'userId and valid index are required' }, { status: 400 });
    }

    // Ищем пользователя по telegramId
    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
      select: { savingGoals: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Создаем новый массив без элемента по указанному индексу
    const newGoals = user.savingGoals.filter((_, i) => i !== index);

    // Обновляем массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        savingGoals: newGoals
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });

    // Возвращаем объекты напрямую
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Ошибка при удалении цели:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/saving-goals - удалить цель начиная с определенной даты и во всех последующих днях
export async function PATCH(request) {
  try {
    const { userId, startDate, goalId } = await request.json();

    console.log('=== НАЧАЛО УДАЛЕНИЯ ЦЕЛИ ===');
    console.log('Полученные параметры:', { userId, startDate, goalId });

    // Ищем пользователя по telegramId
    const user = await prisma.user.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      console.log('Пользователь не найден:', userId);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    console.log('Найден пользователь:', user.id);
    console.log('Текущие savingGoals:', JSON.stringify(user.savingGoals, null, 2));

    // Удаляем цель начиная с startDate и во всех последующих днях
    const updatedSavingGoals = removeGoalFromDate(user.savingGoals, startDate, goalId);

    console.log('Обновленные savingGoals:', JSON.stringify(updatedSavingGoals, null, 2));

    // Обновляем пользователя с новыми savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        savingGoals: updatedSavingGoals
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });

    console.log('Пользователь успешно обновлен:', updatedUser);
    console.log('=== КОНЕЦ УДАЛЕНИЯ ЦЕЛИ ===');

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Ошибка при удалении цели:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Добавляем новый эндпоинт для генерации отчета
export async function GENERATE_REPORT(request) {
  try {
    const { userId, period, goalsArray } = await request.json();

    if (!userId || !period || !goalsArray) {
      return NextResponse.json({
        success: false,
        error: 'userId, period, and goalsArray are required'
      }, { status: 400 });
    }

    // Проверяем, что period является одним из допустимых значений
    const validPeriods = [2, 5, 7, 30, 60, 120];
    if (!validPeriods.includes(period)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid period. Must be one of: 7, 30, 60, 120'
      }, { status: 400 });
    }

    console.log(`Генерация отчета для пользователя ${userId} за последние ${period} дней`);

    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
      select: {
        id: true,
        telegramId: true,
        language: true,
        firstName: true,
        username: true,
        savingGoals: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const lang = user?.language === 'ang' ? 'en' : 'ru'; // DB: rus/ang -> UI: ru/en
    const translations = goalsTranslations[lang] || goalsTranslations.ru;

    const goalsArrayTranslated = lang === 'en'
      ? (Array.isArray(goalsArray) ? goalsArray.map((g) => {
        const m = String(g?.id ?? '').match(/(\d+)$/);
        const goalIdSuffix = m?.[1];
        const tr = goalIdSuffix ? translations?.[goalIdSuffix] : null;
        if (!tr) return g;
        return {
          ...g,
          title: tr.title ?? g.title,
          description: tr.description ?? g.description,
        };
      }) : goalsArray)
      : goalsArray;

    // Анализируем цели и генерируем отчет
    // Для новой структуры данных мы передаем goalsArray напрямую, а не user.savingGoals
    const reportData = analyzeGoalsForPeriod([], goalsArrayTranslated, period);

    // Генерируем текстовый отчет
    const reportText = generateReportText(reportData, user, period, lang);

    return NextResponse.json({
      success: true,
      reportData,
      reportText
    });
  } catch (error) {
    console.error('Ошибка при генерации отчета:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Добавляем новый эндпоинт для полной очистки массива savingGoals у пользователя
export async function CLEAR_ALL_SAVING_GOALS(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 });
    }

    console.log(`Очистка всех целей для пользователя ${userId}`);

    // Ищем пользователя по telegramId
    const user = await prisma.user.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      console.log('Пользователь не найден:', userId);
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    console.log('Найден пользователь:', user.id);

    // Очищаем массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        savingGoals: []
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });

    console.log('Массив savingGoals успешно очищен для пользователя:', updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Все цели успешно очищены'
    });
  } catch (error) {
    console.error('Ошибка при очистке всех целей:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Подсчёт серии дней (подряд с хотя бы одной выполненной целью), как в LightsConteiner
function computeSeriesFromGoalsArray(goalsArray) {
  if (!goalsArray || !Array.isArray(goalsArray)) return 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const allDates = [...new Set(goalsArray.map(g => g.date).filter(Boolean))];
  const pastDates = allDates.filter(d => d < todayStr).sort();
  let num = 0;
  pastDates.forEach(date => {
    const hasCompleted = goalsArray.some(g => g.date === date && g.status === 'completed');
    if (hasCompleted) num += 1;
    else num = 0;
  });
  const todayHasCompleted = goalsArray.some(g => g.date === todayStr && g.status === 'completed');
  if (todayHasCompleted) num += 1;
  return num;
}

// Функция для анализа целей за определенный период
function analyzeGoalsForPeriod(savingGoals, goalsArray, period) {
  // Для новой структуры данных мы будем использовать все цели из goalsArray
  // и фильтровать их по дате в пределах заданного периода
  
  // Определяем конечную дату (сегодня)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - period + 1);
  
  // Фильтруем цели по периоду
  const goalsForPeriod = goalsArray.filter(goal => {
    if (!goal.date) return false;
    const goalDate = new Date(goal.date);
    return goalDate >= startDate && goalDate <= today;
  });

  // Собираем статистику по каждой цели
  const goalStats = {};

  // Проходим по всем целям в массиве goalsArray
  goalsArray.forEach(goal => {
    if (goal && goal.id) {
      goalStats[goal.id] = {
        id: goal.id,
        title: goal.title,
        completedCount: 0,
        totalCount: period,
        completionPercentage: 0
      };
    }
  });

  // Подсчитываем выполненные цели
  goalsArray.forEach(goal => {
    if (goal && goal.id && goalStats[goal.id]) {
      // Проверяем статус цели
      if (goal.status === 'completed') {
        goalStats[goal.id].completedCount++;
      }
    }
  });

  // Вычисляем процент выполнения для каждой цели
  Object.keys(goalStats).forEach(goalId => {
    const stats = goalStats[goalId];
    stats.completionPercentage = Math.round((stats.completedCount / stats.totalCount) * 100);
  });

  // Сортируем цели по количеству выполнений (от большего к меньшему)
  const sortedGoals = Object.values(goalStats).sort((a, b) => b.completedCount - a.completedCount);

  // Находим наиболее выполненные цели
  const topGoals = sortedGoals.filter(goal => goal.completedCount > 0);

  // Создаем данные для графика выполнения по дням
  const chartData = createChartData(goalsForPeriod, goalsArray);
  const series = computeSeriesFromGoalsArray(goalsArray);

  return {
    goalStats,
    sortedGoals,
    topGoals,
    period,
    daysAnalyzed: goalsForPeriod.length,
    chartData,
    series
  };
}

// Функция для генерации текстового отчета
function generateReportText(reportData, user, period, lang = 'ru') {
  const { topGoals, daysAnalyzed, chartData, series = 0 } = reportData;

  const isEn = lang === 'en';
  const months = isEn
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  // Получаем реальные даты из chartData
  const dates = chartData.dates;
  let periodText = isEn ? `${period} days` : `${period} дней`;
  
  if (dates && dates.length > 0) {
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    
    const formatDateShort = (date) => {
      return `${date.getDate()} ${months[date.getMonth()]}`;
    };
    
    periodText = `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;
  }

  // Вычисляем общий процент выполнения
  const totalCompleted = topGoals.reduce((sum, goal) => sum + goal.completedCount, 0);
  const totalPossible = topGoals.reduce((sum, goal) => sum + goal.totalCount, 0);
  const overallPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  if (topGoals.length === 0) {
    return isEn
      ? `📊 WEEKLY RESULT ${periodText}

🏆 Overall goal completion: 0%

No completed goals in this period.`
      : `📊 ИТОГ НЕДЕЛИ ${periodText}

🏆 Общий процент выполнения целей: 0%

Нет выполненных целей за этот период.`;
  }

  // Формируем текст отчета
  let reportText = isEn
    ? `📊 WEEKLY RESULT ${periodText}\n\n`
    : `📊 ИТОГ НЕДЕЛИ ${periodText}\n\n`;
  if (series > 0) {
    reportText += isEn
      ? `Streak: 🔥 ${series} days\n\n`
      : `Серия: 🔥 ${series} дн.\n\n`;
  }
  reportText += isEn
    ? `🏆 Overall goal completion: ${overallPercentage}%\n\n`
    : `🏆 Общий процент выполнения целей: ${overallPercentage}%\n\n`;
  
  reportText += isEn ? "GOAL STATS\n" : "СТАТИСТИКА ПО ЦЕЛЯМ\n";
  const displayedGoals = topGoals.slice(0, 5); // Показываем до 5 целей
  displayedGoals.forEach(goal => {
    reportText += `⭐ ${goal.title} - ${goal.completionPercentage}%\n`;
  });
  
  // Находим лучший день
  let bestDay = "";
  if (chartData.dates && chartData.dates.length > 0) {
    let maxCompletions = 0;
    let bestDayIndex = 0;
    
    for (let i = 0; i < chartData.dates.length; i++) {
      let dayCompletions = 0;
      Object.values(chartData.goalsCompletion).forEach(goal => {
        if (goal.completions[i] === 1) {
          dayCompletions++;
        }
      });
      
      if (dayCompletions > maxCompletions) {
        maxCompletions = dayCompletions;
        bestDayIndex = i;
      }
    }
    
    if (maxCompletions > 0) {
      const bestDate = new Date(chartData.dates[bestDayIndex]);
      const weekdays = isEn
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
      bestDay = isEn
        ? `${weekdays[bestDate.getDay()]} (${maxCompletions} goals done)`
        : `${weekdays[bestDate.getDay()]} (${maxCompletions} цели выполнены)`;
    }
  }

  reportText += isEn ? "\n📈 PERIOD STATS\n" : "\n📈 СТАТИСТИКА ПЕРИОДА\n";
  reportText += isEn
    ? `• Overall progress: ${overallPercentage}%\n`
    : `• Общий прогресс: ${overallPercentage}%\n`;
  reportText += isEn
    ? `• Completed: ${totalCompleted} of ${totalPossible} possible\n`
    : `• Выполнено: ${totalCompleted} из ${totalPossible} возможных\n`;
  reportText += isEn
    ? `• Active days: ${dates ? dates.length : daysAnalyzed} days\n`
    : `• Активных дней: ${dates ? dates.length : daysAnalyzed} дней\n`;
  if (bestDay) {
    reportText += isEn
      ? `• Best day: ${bestDay}\n\n`
      : `• Лучший день: ${bestDay}\n\n`;
  } else {
    reportText += "\n";
  }
  
  reportText += isEn ? "\n⭐ Next goal: " : "\n⭐ Следующая цель: ";
  if (overallPercentage >= 70) {
    reportText += isEn ? "Maintain a high completion rate!" : "Поддерживать высокий уровень выполнения!";
  } else if (overallPercentage >= 50) {
    reportText += isEn ? "Reach 70% completion across all goals!" : "Достичь 70% выполнения по всем целям!";
  } else if (overallPercentage >= 30) {
    reportText += isEn ? "Reach 50% completion across all goals!" : "Достичь 50% выполнения по всем целям!";
  } else {
    reportText += isEn ? "Reach 30% completion across all goals!" : "Достичь 30% выполнения по всем целям!";
  }

  return reportText;
}

// Новая функция для создания данных графика
function createChartData(goalsForPeriod, goalsArray) {
  // Создаем уникальный список дат из целей
  const uniqueDates = [...new Set(goalsArray.map(goal => goal.date))].sort();
  
  // Создаем карту для быстрого поиска индекса даты
  const dateIndexMap = {};
  uniqueDates.forEach((date, index) => {
    dateIndexMap[date] = index;
  });

  // Подготавливаем данные для графика
  const dates = uniqueDates;
  const goalsCompletion = {};

  // Инициализируем структуру данных для каждой цели
  goalsArray.forEach(goal => {
    if (goal && goal.id) {
      if (!goalsCompletion[goal.id]) {
        goalsCompletion[goal.id] = {
          title: goal.title,
          completions: Array(uniqueDates.length).fill(0)
        };
      }
    }
  });

  // Заполняем данные о выполнении для каждой цели по датам
  goalsArray.forEach(goal => {
    if (goal && goal.id && goal.date && goalsCompletion[goal.id]) {
      const dateIndex = dateIndexMap[goal.date];
      if (dateIndex !== undefined) {
        // Устанавливаем 1 если цель выполнена, 0 если нет
        goalsCompletion[goal.id].completions[dateIndex] = 
          goal.status === 'completed' ? 1 : 0;
      }
    }
  });

  return {
    dates,
    goalsCompletion
  };
}
