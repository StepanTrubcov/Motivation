import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id: userId } = await params;
    const { achievements } = await request.json();

    if (!achievements || !Array.isArray(achievements)) {
      return NextResponse.json({ error: 'Achievements must be an array' }, { status: 400 });
    }

    const processedAchievements = [];

    for (const ach of achievements) {
      const existing = await prisma.achievement.findFirst({
        where: { userId, title: ach.title }
      });

      if (existing) {
        processedAchievements.push(existing);
      } else {
        const created = await prisma.achievement.create({
          data: {
            title: ach.title,
            description: ach.description,
            requirement: ach.requirement,
            status: ach.status,
            image: ach.image,
            points: ach.points,
            type: ach.type,
            goalIds: ach.goalIds || [],
            target: ach.target,
            userId
          }
        });
        processedAchievements.push(created);
      }
    }

    return NextResponse.json(processedAchievements);
  } catch (error) {
    console.error('Error saving achievements:', error);
    return NextResponse.json({ error: 'Не удалось сохранить достижения' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id: userId } = await params;

    const achievements = await prisma.achievement.findMany({
      where: { userId }
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Не удалось получить достижения' }, { status: 500 });
  }
}
