import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id: userId, achievementId } = await params;
    const { newStatus } = await request.json();

    if (!newStatus) {
      return NextResponse.json({ error: 'newStatus is required' }, { status: 400 });
    }

    const achievement = await prisma.achievement.findFirst({
      where: { id: String(achievementId), userId: String(userId) }
    });

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    if (achievement.status === newStatus) {
      return NextResponse.json({ achievement, changed: false });
    }

    // Начисляем очки на сервере и только при реальном переходе в `my`.
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.achievement.update({
        where: { id: achievement.id },
        data: { status: newStatus }
      });

      let ptsAdded = 0;
      if (achievement.status !== 'my' && newStatus === 'my') {
        ptsAdded = Math.max(0, Number(updated.points) || 0);
        if (ptsAdded > 0) {
          await tx.user.update({
            where: { id: String(userId) },
            data: { pts: { increment: ptsAdded } }
          });
        }
      }

      return { updated, ptsAdded };
    });

    return NextResponse.json({ achievement: result.updated, changed: true, ptsAdded: result.ptsAdded });
  } catch (error) {
    console.error('Error updating achievement status:', error);
    return NextResponse.json({ error: 'Не удалось изменить статус достижения' }, { status: 500 });
  }
}
