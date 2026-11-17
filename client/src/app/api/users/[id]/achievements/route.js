import { readSnapshot } from '@/lib/progress/readSnapshot.mjs';
import { readUser, readGoals, readAchievements } from '@/lib/progress/store.mjs';
import { decorateAchievementArtwork } from '@/lib/achievementImages';
import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { syncAchievementCatalog } from '@/lib/syncAchievementCatalog.mjs';
import { achievementProgress } from '@/lib/achievementEligibility.mjs';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    return NextResponse.json(await syncAchievementCatalog(prisma, id));
  } catch (error) {
    console.error('Achievement initialization failed:', error);
    return NextResponse.json({ error: 'Не удалось загрузить ачивки' }, { status: 500 });
  }
}
export async function GET(request, { params }) {
  try {
    const { id: userId } = await params;
    const { assignments, user, goals } = await readSnapshot(prisma, async tx => {
      const user = await readUser(tx, { id: userId });
      const [assignments, goals] = await Promise.all([readAchievements(tx, userId, user), readGoals(tx, userId, user)]);
      return { assignments, user, goals };
    });
    return NextResponse.json(assignments.map(row => decorateAchievementArtwork({ ...row,
      progress: achievementProgress(row, { assignments, user, goals, calendar: user?.savingGoals || [] }) })));
  } catch (error) {
    console.error('Achievement read failed:', error);
    return NextResponse.json({ error: 'Не удалось загрузить ачивки' }, { status: 500 });
  }
}
