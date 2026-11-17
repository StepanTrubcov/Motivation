import { readSnapshot } from '@/lib/progress/readSnapshot.mjs';
import frozenCatalogs from '@/lib/progress/goalCatalogVersions.json';
import { readUser, readGoals } from '@/lib/progress/store.mjs';
import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { TEST_CATALOG_USER_ID, decorateTestGoal } from '@/lib/testGoalCatalog';
import { decorateGoalTime, getSavedGoalTimeSettings } from '@/lib/goalTimeOptions';
import { goalsTranslations } from '@/utils/goalsTranslations';

// Чтобы Next.js не кэшировал ответ и всегда пересчитывал language по БД.
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    // По `language` в БД определяем язык выдачи текстов целей.
    const { user, goals } = await readSnapshot(prisma, async tx => {
      const user = await readUser(tx, { id: String(userId) });
      return { user, goals: await readGoals(tx, String(userId), user) };
    });

    const lang = user?.language === 'ang' ? 'en' : 'ru'; // DB: rus/ang -> UI: ru/en
    const translations = goalsTranslations[lang] || goalsTranslations.ru;


    // Переводим только "стандартные" цели, у которых id хранится как `${userId}_${goal.id}`.
    // Для пользовательских/custom целей перевода может не быть — тогда оставляем как есть.
    const translatedGoals = goals.map((rawGoal) => {
      const goal = ['in_progress', 'completed'].includes(rawGoal.status)
        ? { ...rawGoal, ...getSavedGoalTimeSettings(rawGoal, user?.savingGoals) }
        : rawGoal;
      if (String(userId) === TEST_CATALOG_USER_ID) return decorateGoalTime(decorateTestGoal(goal, lang), lang);
      // В `Goal.id` для стандартных целей хранится `${userId}_${goal.id}`.
      // Достаём последние цифры независимо от того, как именно составлен префикс userId.
      const m = String(goal.id).startsWith(`${userId}_`) ? String(goal.id).slice(String(userId).length + 1).match(/^(\d+)$/) : null;
      const goalIdSuffix = m?.[1];

      // Суффикс должен быть числовым (1..75).
      if (!goalIdSuffix) return decorateGoalTime(goal, lang);

      const tr = (goal.catalogVersion ? frozenCatalogs.translations[lang] : translations)?.[goalIdSuffix];
      if (!tr) return decorateGoalTime(goal, lang);

      return decorateGoalTime({
        ...goal,
        title: tr.title ?? goal.title,
        baseTitle: tr.title ?? goal.title,
        description: tr.description ?? goal.description,
      }, lang);
    });

    return NextResponse.json(translatedGoals);
  } catch (error) {
    console.error('Error in /api/goals/:userId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
