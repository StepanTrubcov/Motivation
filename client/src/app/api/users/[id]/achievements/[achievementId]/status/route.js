import { readUser, readGoals, readAchievements, awardAchievement } from '@/lib/progress/store.mjs';
import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { canUnlockAchievement, isFirstHundred } from '@/lib/achievementEligibility.mjs';

export async function PUT(request, { params }) {
  try {
    const { id: userId, achievementId } = await params;
    const { newStatus, event } = await request.json();
    if (newStatus !== 'my') return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    let result;
    for (let attempt = 0; ; attempt++) {
      try {
        result = await prisma.$transaction(async tx => {
      const user = await readUser(tx, { id: userId });
      const [goals, assignments] = await Promise.all([readGoals(tx, userId, user), readAchievements(tx, userId, user)]);
      const achievement = assignments.find(row => row.id === achievementId);
      if (!achievement || !user) throw Object.assign(new Error('Not found'), { status: 404 });
      if (achievement.status === 'my') return { achievement, changed: false };
      const first100 = achievement.templateId === 'v2:27' && await isFirstHundred(tx, userId);
      if (!canUnlockAchievement(achievement, { goals, assignments, user, first100, tutorialCompleted: event === 'tutorial_completed' })) {
        throw Object.assign(new Error('Условие получения ачивки ещё не выполнено'), { status: 409 });
      }
      const updated = await awardAchievement(tx, user, achievement);
      return { achievement: updated, changed: true };
        }, { isolationLevel: 'Serializable', timeout: 15000 });
        break;
      } catch (error) {
        if (error.code === 'P2034' && attempt < 3) continue;
        throw error;
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.status ? error.message : 'Не удалось сохранить ачивку' }, { status: error.status || 500 });
  }
}
