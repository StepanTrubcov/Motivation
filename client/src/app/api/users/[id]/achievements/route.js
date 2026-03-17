import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id: userId } = await params;
    const { achievements } = await request.json();

    if (!achievements || !Array.isArray(achievements)) {
      return NextResponse.json({ error: 'Achievements must be an array' }, { status: 400 });
    }

    // IMPORTANT:
    // This endpoint is called on every app start (initializeAchievements).
    // It must be idempotent and MUST NOT reset already earned achievements.
    //
    // Strategy:
    // - Match existing achievements by (userId + title)
    // - If exists: update fields but preserve status="my" once earned
    // - If missing: create with provided status (default "locked")

    const existingAchievements = await prisma.achievement.findMany({ where: { userId } });
    const existingByTitle = new Map(existingAchievements.map((a) => [a.title, a]));

    const results = [];
    for (const ach of achievements) {
      const title = ach?.title;
      if (!title) continue;

      const existing = existingByTitle.get(title);
      const desiredStatus = ach.status || 'locked';
      const nextStatus = existing?.status === 'my' ? 'my' : desiredStatus;

      if (existing) {
        const updated = await prisma.achievement.update({
          where: { id: existing.id },
          data: {
            description: ach.description || "",
            requirement: ach.requirement || "",
            status: nextStatus,
            image: ach.image || "",
            gif: ach.gif || "",
            points: ach.points || 0,
            type: ach.type || null,
            goalIds: ach.goalIds || [],
            target: ach.target || null,
            rarity: ach.rarity || "common",
          },
        });
        results.push(updated);
      } else {
        const created = await prisma.achievement.create({
          data: {
            title,
            description: ach.description || "",
            requirement: ach.requirement || "",
            status: desiredStatus,
            image: ach.image || "",
            gif: ach.gif || "",
            points: ach.points || 0,
            type: ach.type || null,
            goalIds: ach.goalIds || [],
            target: ach.target || null,
            rarity: ach.rarity || "common",
            userId,
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error saving achievements:', error);
    return NextResponse.json({ error: 'Не удалось сохранить достижения', details: error.message }, { status: 500 });
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