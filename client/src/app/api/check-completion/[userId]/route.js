import { readSnapshot } from '@/lib/progress/readSnapshot.mjs';
import frozenCatalogs from '@/lib/progress/goalCatalogVersions.json';
import { readUser, readGoals } from '@/lib/progress/store.mjs';
import { rollOverGoals } from '@/lib/dailyGoalRollover.mjs';
import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { goalsTranslations } from '@/utils/goalsTranslations';
import { decorateGoalTime, getSavedGoalTimeSettings } from '@/lib/goalTimeOptions';
import { TEST_CATALOG_USER_ID, decorateTestGoal } from '@/lib/testGoalCatalog';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;

    await rollOverGoals(prisma, String(userId));
    const { user, goals } = await readSnapshot(prisma, async tx => {
      const user = await readUser(tx, { id: String(userId) });
      return { user, goals: await readGoals(tx, String(userId), user) };
    });
    const lang = user?.language === 'ang' ? 'en' : 'ru';
    const translations = goalsTranslations[lang] || goalsTranslations.ru;

    // Переводим только стандартные цели (id вида `${userId}_${goalId}`).
    const translatedGoals = goals.map((rawGoal) => {
      const goal = ['in_progress', 'completed'].includes(rawGoal.status)
        ? { ...rawGoal, ...getSavedGoalTimeSettings(rawGoal, user?.savingGoals) }
        : rawGoal;
      const m = String(goal.id).startsWith(`${userId}_`) ? String(goal.id).slice(String(userId).length + 1).match(/^(\d+)$/) : null;
      const goalIdSuffix = m?.[1];
      if (String(userId) === TEST_CATALOG_USER_ID) return decorateGoalTime(decorateTestGoal(goal, lang), lang);
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
    console.error('Error in /api/check-completion/:userId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
