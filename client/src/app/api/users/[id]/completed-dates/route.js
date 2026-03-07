import { prisma } from '@/lib/prisma/prismaPostgresClient';
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

// Новая функция для удаления даты
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Дата обязательна" }, { status: 400 });
    }

    // Получаем текущего пользователя и его completedDates
    const user = await prisma.user.findUnique({
      where: { telegramId: id },
      select: { completedDates: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const dateIndex = user.completedDates.indexOf(date);
    let updatedDates;
    
    if (dateIndex !== -1) {
      updatedDates = [...user.completedDates];
      updatedDates.splice(dateIndex, 1);
    } else {
      updatedDates = user.completedDates;
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: id },
      data: {
        completedDates: updatedDates
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Ошибка удаления даты:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}