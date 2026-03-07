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
      where: { userId }
    });

    console.log(`Found ${existingAchievements.length} existing achievements in database`);
    
    // Создаем Map для быстрого поиска существующих достижений по title
    const existingMap = new Map();
    existingAchievements.forEach(ach => {
      existingMap.set(ach.title, ach);
    });
    
    // Определяем, какие достижения нужно добавить (новые)
    const achievementsToAdd = achievements.filter(ach => !existingMap.has(ach.title));
    console.log(`Need to add ${achievementsToAdd.length} new achievements`);
    
    // Определяем, какие достижения нужно обновить (уже существуют)
    const achievementsToUpdate = achievements.filter(ach => {
      const existing = existingMap.get(ach.title);
      return existing && (
        existing.status !== ach.status ||
        existing.points !== (ach.points || 0) ||
        existing.type !== (ach.type || null)
      );
    });
    console.log(`Need to update ${achievementsToUpdate.length} existing achievements`);
    
    // Удаляем все существующие достижения (чтобы избежать дубликатов)
    if (existingAchievements.length > 0) {
      console.log(`Deleting ${existingAchievements.length} existing achievements to prevent duplicates`);
      await prisma.achievement.deleteMany({
        where: { userId }
      });
    }

    // Создаем все достижения заново (и старые, и новые)
    const allAchievementsToCreate = [...achievements];
    
    console.log(`Creating ${allAchievementsToCreate.length} achievements`);
    
    // Разбиваем на пакеты по 10 достижений для избежания таймаутов
    const batchSize = 10;
    const createdAchievements = [];

    for (let i = 0; i < allAchievementsToCreate.length; i += batchSize) {
      const batch = allAchievementsToCreate.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allAchievementsToCreate.length/batchSize)}`);
      
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
      createdAchievements.push(...batchResults);
      
      // Небольшая пауза между пакетами
      if (i + batchSize < allAchievementsToCreate.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Successfully created ${createdAchievements.length} achievements`);
    return NextResponse.json(createdAchievements);
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