import { prisma } from '@/lib/prisma/prismaClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Дата обязательна" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { telegramId: id },
      data: {
        completedDates: { push: date }
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Ошибка добавления даты:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { telegramId: id },
      select: { completedDates: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json(user.completedDates);
  } catch (error) {
    console.error("Ошибка получения дат:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
