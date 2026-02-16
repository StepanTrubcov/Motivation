import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { telegramId } = await params;
    const { goalsDone = [], goalsInProgress = [], userTag, formattedDate, series } = await request.json();

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

    const seriesLine = (series > 2) ? `\n\nСерия: 🔥 ${series} дн.` : '';

    const headerParts = [formattedDate, userTag];
    if (seriesLine) headerParts.push(seriesLine);
    const header = headerParts.join(' ');
    const finalMessage = [header, goalsList, diaryNote, "Отчёт сделан с помощью @BotMotivation_TG_bot"].join('\n\n').trim();

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
