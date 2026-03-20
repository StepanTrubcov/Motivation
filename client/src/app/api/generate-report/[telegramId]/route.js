import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { goalsTranslations } from '@/utils/goalsTranslations';

const reportCopy = {
  ru: {
    diaryAll: "Сегодня я справился со всеми задачами. Я доволен результатом и чувствую прогресс! 🔥",
    diaryAlmost: "Сегодня я справился почти со всеми задачами. Отличный день! ⚡",
    diaryHalf: "Сегодня я сделал половину запланированного. Всё идёт по плану. 🌱",
    diarySome: "Сегодня я выполнил часть целей. Это только начало! 💪",
    diaryNone: "Сегодня получилось меньше, чем хотелось, но завтра я сделаю больше. 💡",
    series: "Серия: 🔥",
    days: "дн.",
    footer: "Отчёт сделан с помощью @BotMotivation_TG_bot",
  },
  en: {
    diaryAll: "Today I completed all my tasks. I'm happy with the result and feel progress! 🔥",
    diaryAlmost: "Today I completed almost all tasks. Great day! ⚡",
    diaryHalf: "Today I did half of what I planned. Everything is on track. 🌱",
    diarySome: "Today I completed some goals. This is just the beginning! 💪",
    diaryNone: "Today was less than I hoped, but tomorrow I'll do more. 💡",
    series: "Streak: 🔥",
    days: "days",
    footer: "Report made with @BotMotivation_TG_bot",
  },
};

export async function POST(request, { params }) {
  try {
    const { telegramId } = await params;
    const { goalsDone = [], goalsInProgress = [], userTag, formattedDate, series, language = 'ru' } = await request.json();

    if (!Array.isArray(goalsDone) || !Array.isArray(goalsInProgress)) {
      return NextResponse.json({ error: "Нужны массивы goalsDone и goalsInProgress" }, { status: 400 });
    }

    const allGoals = [...goalsDone, ...goalsInProgress];
    if (allGoals.length === 0) {
      return NextResponse.json({ error: "Нет целей для отчёта" }, { status: 400 });
    }

    // Язык берём из БД по telegramId (а не из запроса), чтобы не зависеть от localStorage UI.
    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
      select: { language: true },
    });

    const langFromDb = user?.language === 'ang' ? 'en' : 'ru';
    const lang = langFromDb || (language === 'en' ? 'en' : 'ru');
    const copy = reportCopy[lang];

    // Дата приходит строкой, сформированной на клиенте (обычно из localStorage).
    // Для англ. режима переводим русское название месяца в английское.
    const formattedDateTranslated = (() => {
      if (lang !== 'en' || !formattedDate) return formattedDate;

      const monthMap = {
        'января': 'January',
        'февраля': 'February',
        'марта': 'March',
        'апреля': 'April',
        'мая': 'May',
        'июня': 'June',
        'июля': 'July',
        'августа': 'August',
        'сентября': 'September',
        'октября': 'October',
        'ноября': 'November',
        'декабря': 'December',
      };

      const s = String(formattedDate).trim();
      // Пример: "20 марта"
      const m = s.match(/^(\d{1,2})\s+([A-Za-zА-Яа-яЁё]+)\s*$/);
      if (!m) return formattedDate;

      const day = m[1];
      const monthRu = m[2].toLowerCase().replace('ё', 'е');
      const monthEn = monthMap[monthRu];

      return monthEn ? `${day} ${monthEn}` : formattedDate;
    })();

    const doneCount = goalsDone.length;
    const totalCount = allGoals.length;
    const ratio = doneCount / totalCount;

    // Если английский, подменяем title/description для стандартных целей.
    const translations = goalsTranslations[lang] || goalsTranslations.ru;
    const translateGoal = (goal) => {
      if (!goal?.id) return goal;
      const m = String(goal.id).match(/(\d+)$/);
      const goalIdSuffix = m?.[1];
      if (!goalIdSuffix) return goal;
      const tr = translations?.[goalIdSuffix];
      if (!tr) return goal;
      return {
        ...goal,
        title: tr.title ?? goal.title,
        description: tr.description ?? goal.description,
      };
    };

    const allGoalsTranslated = lang === 'en'
      ? allGoals.map((g) => translateGoal(g))
      : allGoals;

    let diaryNote = '';
    if (ratio >= 1) diaryNote = copy.diaryAll;
    else if (ratio >= 0.8) diaryNote = copy.diaryAlmost;
    else if (ratio >= 0.5) diaryNote = copy.diaryHalf;
    else if (doneCount > 0) diaryNote = copy.diarySome;
    else diaryNote = copy.diaryNone;

    const goalsList = allGoalsTranslated
      .map(g => {
        const title = String(g.title || '').replace(/\u00A0/g, ' ').trim();
        const statusIcon = g.status === 'completed' ? '✅' : '☑️';
        return `${statusIcon} ${title}`;
      })
      .join('\n\n');

    const today = new Date();

    const seriesLine = (series > 2) ? `\n\n${copy.series} ${series} ${copy.days}` : '';

    const headerParts = [formattedDateTranslated, userTag];
    if (seriesLine) headerParts.push(seriesLine);
    const header = headerParts.join(' ');
    const finalMessage = [header, goalsList, diaryNote, copy.footer].join('\n\n').trim();

    return NextResponse.json({
      message: finalMessage,
      success: true,
      report: { text: finalMessage, date: today.toISOString() }
    });
  } catch (error) {
    console.error('Error in /api/generate-report:', error);
    return NextResponse.json({ error: 'Ошибка при генерации отчёта: ' + error.message }, { status: 500 });
  }
}
