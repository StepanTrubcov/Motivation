import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id: userId } = await params;
    const { achievements } = await request.json();

    if (!achievements || !Array.isArray(achievements)) {
      return NextResponse.json({ error: 'Achievements must be an array' }, { status: 400 });
    }

    console.log(`Received ${achievements.length} achievements for user ${userId}`);
    
    // Получаем все существующие достижения пользователя
    const existingAchievements = await prisma.achievement.findMany({
      where: { userId },
      select: { title: true, id: true }
    });

    const existingTitles = new Set(existingAchievements.map(a => a.title));
    console.log(`Found ${existingTitles.size} existing achievements in database`);
    
    // Фильтруем только те достижения, которых еще нет в базе
    const achievementsToAdd = achievements.filter(ach => !existingTitles.has(ach.title));
    console.log(`Need to add ${achievementsToAdd.length} new achievements`);

    if (achievementsToAdd.length === 0) {
      console.log('All achievements already exist in database');
      // Возвращаем все существующие достижения
      const allAchievements = await prisma.achievement.findMany({
        where: { userId }
      });
      return NextResponse.json(allAchievements);
    }

    // Разбиваем на пакеты по 10 достижений для избежания таймаутов
    const batchSize = 10;
    const processedAchievements = [];

    for (let i = 0; i < achievementsToAdd.length; i += batchSize) {
      const batch = achievementsToAdd.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(achievementsToAdd.length/batchSize)}`);
      
      // Обрабатываем пакет параллельно
      const promises = batch.map(async (ach) => {
        return await prisma.achievement.create({
          data: {
            title: ach.title,
            description: ach.description || "",
            requirement: ach.requirement || "",
            status: ach.status || "locked",
            image: ach.image || "",
            gif: ach.gif || "",
            points: ach.points || 0,
            type: ach.type || null,
            goalIds: ach.goalIds || [],
            target: ach.target || null,
            rarity: ach.rarity || "common",
            userId
          }
        });
      });

      const batchResults = await Promise.all(promises);
      processedAchievements.push(...batchResults);
      
      // Небольшая пауза между пакетами
      if (i + batchSize < achievementsToAdd.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Successfully added ${processedAchievements.length} new achievements`);
    
    // Возвращаем все достижения пользователя (старые + новые)
    const allAchievements = await prisma.achievement.findMany({
      where: { userId }
    });
    
    console.log(`Total achievements for user: ${allAchievements.length}`);
    return NextResponse.json(allAchievements);
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
