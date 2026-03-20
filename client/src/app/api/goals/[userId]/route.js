import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { goalsTranslations } from '@/utils/goalsTranslations';

// Чтобы Next.js не кэшировал ответ и всегда пересчитывал language по БД.
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    // По `language` в БД определяем язык выдачи текстов целей.
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { language: true },
    });

    const lang = user?.language === 'ang' ? 'en' : 'ru'; // DB: rus/ang -> UI: ru/en
    const translations = goalsTranslations[lang] || goalsTranslations.ru;

    const goals = await prisma.goal.findMany({
      where: { userId: String(userId) },
    });

    // Переводим только "стандартные" цели, у которых id хранится как `${userId}_${goal.id}`.
    // Для пользовательских/custom целей перевода может не быть — тогда оставляем как есть.
    const translatedGoals = goals.map((goal) => {
      // В `Goal.id` для стандартных целей хранится `${userId}_${goal.id}`.
      // Достаём последние цифры независимо от того, как именно составлен префикс userId.
      const m = String(goal.id).match(/(\d+)$/);
      const goalIdSuffix = m?.[1];

      // Суффикс должен быть числовым (1..75).
      if (!goalIdSuffix) return goal;

      const tr = translations?.[goalIdSuffix];
      if (!tr) return goal;

      return {
        ...goal,
        title: tr.title ?? goal.title,
        description: tr.description ?? goal.description,
      };
    });

    return NextResponse.json(translatedGoals);
  } catch (error) {
    console.error('Error in /api/goals/:userId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
