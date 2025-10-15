import { prisma } from '@/lib/prisma/prismaClient';
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

    const updated = await prisma.achievement.update({
      where: { id: achievement.id },
      data: { status: newStatus }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating achievement status:', error);
    return NextResponse.json({ error: 'Не удалось изменить статус достижения' }, { status: 500 });
  }
}
