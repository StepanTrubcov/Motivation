import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { telegramId, firstName, username, photoUrl, usersTag } = await request.json();

    console.log('Получен запрос на создание/обновление пользователя:', { telegramId, firstName, username, photoUrl, usersTag });

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
            usersTag,
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
          usersTag,
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

export async function PUT(request) {
  try {
    const { telegramId, language } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    }
    if (!language) {
      return NextResponse.json({ error: 'language is required' }, { status: 400 });
    }

    const normalized = String(language).toLowerCase();
    const dbLanguage = normalized === 'ru' || normalized === 'rus' ? 'rus'
      : normalized === 'en' || normalized === 'ang' ? 'ang'
      : null;

    if (!dbLanguage) {
      return NextResponse.json({ error: "language must be one of: 'rus' or 'ang' (or 'ru'/'en')" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
      select: { id: true, telegramId: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { language: dbLanguage },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Ошибка в /api/users (PUT):', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}