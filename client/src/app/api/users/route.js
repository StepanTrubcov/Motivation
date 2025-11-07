import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { telegramId, firstName, username, photoUrl } = await request.json();
    
    console.log('Получен запрос на создание/обновление пользователя:', { telegramId, firstName, username, photoUrl });

    let user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });
    
    console.log('Поиск пользователя в базе данных:', user ? 'Найден' : 'Не найден');

    if (user) {
      console.log('Обновление существующего пользователя');
      if (!user.registrationDate) {
        console.log('У пользователя нет даты регистрации, удаляем достижения и пользователя');
        await prisma.achievement.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log('Создание нового пользователя');

        user = await prisma.user.create({
          data: {
            telegramId: String(telegramId),
            firstName,
            username,
            photoUrl,
            registrationDate: new Date(),
            // Добавляем значение по умолчанию для savingGoals
            savingGoals: []
          },
        });
      } else {
        console.log('Обновление данных пользователя');
        user = await prisma.user.update({
          where: { telegramId: String(telegramId) },
          data: { firstName, username, photoUrl },
        });
      }
    } else {
      console.log('Создание нового пользователя');
      user = await prisma.user.create({
        data: {
          telegramId: String(telegramId),
          firstName,
          username,
          photoUrl,
          registrationDate: new Date(),
          // Добавляем значение по умолчанию для savingGoals
          savingGoals: []
        },
      });
    }
    
    console.log('Пользователь успешно создан/обновлен:', user);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Ошибка в /api/users:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}