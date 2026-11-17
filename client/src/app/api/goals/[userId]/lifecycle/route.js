import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { commitGoalLifecycle } from '@/lib/goalLifecycle.mjs';
import { getGoalTimeConfig, getSavedGoalTimeSettings } from '@/lib/goalTimeOptions';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    const input = await request.json();
    const result = await commitGoalLifecycle(prisma, userId, input, (goal, settings) => {
      if (settings.action === 'remove') return;
      const config = getGoalTimeConfig(goal);
      const invalid = settings.quantity != null && !config?.quantityOptions?.includes(settings.quantity)
        || settings.durationMinutes != null && !(settings.action === 'create'
          ? [10, 20, 30, 60, 90, 120].includes(settings.durationMinutes)
          : config?.durationOptions?.includes(settings.durationMinutes))
        || settings.targetTime != null && !(config?.timePicker && /^([01]\d|2[0-3]):[0-5]\d$/.test(settings.targetTime));
      if (invalid) throw Object.assign(new Error('Invalid goal settings'), { status: 400 });
    });
    return NextResponse.json({ ...result, goal: { ...result.goal,
      ...(['in_progress', 'completed'].includes(result.goal.status) ? getSavedGoalTimeSettings(result.goal, result.user.savingGoals) : {}) } });
  } catch (error) {
    return NextResponse.json({ error: error.status ? error.message : 'Не удалось сохранить цель' }, { status: error.status || 500 });
  }
}
