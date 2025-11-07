import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// POST /api/saving-goals - добавить новую цель пользователю
export async function POST(request) {
  try {
    const { userId, goalData } = await request.json();
    
    // Преобразуем объект цели в строку JSON для хранения в String[] массиве
    const goalString = JSON.stringify(goalData);
    
    // Добавляем новую цель в массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        savingGoals: {
          push: goalString
        }
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Ошибка при добавлении цели:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET /api/saving-goals?userId={userId} - получить цели пользователя
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    // Преобразуем строки JSON обратно в объекты
    const goalsObjects = user.savingGoals.map(goalString => JSON.parse(goalString));
    
    return NextResponse.json({ success: true, savingGoals: goalsObjects });
  } catch (error) {
    console.error('Ошибка при получении целей:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/saving-goals - обновить все цели пользователя
export async function PUT(request) {
  try {
    const { userId, goalsArray } = await request.json();
    
    // Преобразуем массив объектов в массив строк JSON
    const goalsStrings = goalsArray.map(goal => JSON.stringify(goal));
    
    // Обновляем весь массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        savingGoals: goalsStrings
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Ошибка при обновлении целей:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/saving-goals?userId={userId}&index={index} - удалить цель по индексу
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const index = searchParams.get('index');
    
    if (!userId || index === null) {
      return NextResponse.json({ success: false, error: 'userId and index are required' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    // Создаем новый массив без элемента по указанному индексу
    const newGoals = user.savingGoals.filter((_, i) => i != index);
    
    // Обновляем массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        savingGoals: newGoals
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Ошибка при удалении цели:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}