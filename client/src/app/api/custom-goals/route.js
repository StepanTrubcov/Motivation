import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

// POST /api/custom-goals - создание новой пользовательской цели
export async function POST(request) {
  try {
    const { userId, title, category } = await request.json();

    // Валидация входных данных
    if (!userId || !title || !category) {
      return NextResponse.json(
        { error: 'userId, title, and category are required' }, 
        { status: 400 }
      );
    }

    // Проверка, что категория допустима
    const validCategories = ['Sport', 'Discipline', 'Self_development', 'Spirituality'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Создание новой цели
    const newGoal = await prisma.goal.create({
      data: {
        title,
        points: 20, // По умолчанию 20 очков для пользовательских целей
        status: 'not_started',
        category,
        progress: 0,
        description: `Пользовательская цель: ${title}`,
        userId,
      },
    });

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating custom goal:', error);
    return NextResponse.json(
      { error: 'Failed to create custom goal' }, 
      { status: 500 }
    );
  }
}