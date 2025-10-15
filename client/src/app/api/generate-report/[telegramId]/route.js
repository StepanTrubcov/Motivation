import { prisma } from '@/lib/prisma/prismaClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { telegramId } = await params;
    const { goalsDone = [], goalsInProgress = [] } = await request.json();

    if (!Array.isArray(goalsDone) || !Array.isArray(goalsInProgress)) {
      return NextResponse.json({ error: "Нужны массивы goalsDone и goalsInProgress" }, { status: 400 });
    }

    const allGoals = [...goalsDone, ...goalsInProgress];
    if (allGoals.length === 0) {
      return NextResponse.json({ error: "Нет целей для отчёта" }, { status: 400 });
    }

    const doneCount = goalsDone.length;
    const totalCount = allGoals.length;
    const ratio = doneCount / totalCount;

    let diaryNote = '';
    if (ratio >= 1) diaryNote = "Сегодня я справился со всеми задачами. Я доволен результатом и чувствую прогресс! 🔥";
    else if (ratio >= 0.8) diaryNote = "Сегодня я справился почти со всеми задачами. Отличный день! ⚡";
    else if (ratio >= 0.5) diaryNote = "Сегодня я сделал половину запланированного. Всё идёт по плану. 🌱";
    else if (doneCount > 0) diaryNote = "Сегодня я выполнил часть целей. Это только начало! 💪";
    else diaryNote = "Сегодня получилось меньше, чем хотелось, но завтра я сделаю больше. 💡";

    const goalsList = allGoals
      .map(g => {
        const title = String(g.title || '').replace(/\u00A0/g, ' ').trim();
        const statusIcon = g.status === 'completed' ? '✅' : '☑️';
        return `${statusIcon} ${title}`;
      })
      .join('\n\n');

    const today = new Date();
    const todayString = today.toDateString();
    const formattedDate = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    const finalMessage = [`${formattedDate} #v1 #дд`, goalsList, diaryNote].join('\n\n').trim();

    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    let prevReports = Array.isArray(user.yesterdayReport) ? user.yesterdayReport : [];
    let yesterdayReport = null;

    if (prevReports.length === 2) {
      const prevSecond = prevReports[1];
      const prevSecondDate = new Date(prevSecond.date).toDateString();
      if (prevSecondDate !== todayString) {
        yesterdayReport = prevSecond;
      } else {
        yesterdayReport = prevReports[0] || null;
      }
    } else if (prevReports.length === 1) {
      const prevDate = new Date(prevReports[0].date).toDateString();
      if (prevDate !== todayString) yesterdayReport = prevReports[0];
    }

    const todayReport = { text: finalMessage, date: today.toISOString() };
    const reports = [yesterdayReport, todayReport];

    await prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { yesterdayReport: reports },
    });

    return NextResponse.json({ message: finalMessage, success: true, savedReports: reports });
  } catch (error) {
    console.error('Error in /api/generate-report:', error);
    return NextResponse.json({ error: 'Ошибка при генерации отчёта: ' + error.message }, { status: 500 });
  }
}
