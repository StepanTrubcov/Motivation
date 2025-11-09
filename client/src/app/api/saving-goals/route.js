import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Функция для создания 30 дней с сегодняшнего дня
function create30DaysGoals(initialGoalData) {
  const goals = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const goalObject = {
      date: date.toISOString().split('T')[0], // Формат YYYY-MM-DD
      goalData: initialGoalData ? [initialGoalData] : []
    };
    
    goals.push(JSON.stringify(goalObject));
  }
  
  return goals;
}

// Функция для обновления целей с определенной даты
function updateGoalsFromDate(goals, targetDate, newGoalData) {
  return goals.map(goalString => {
    const goal = JSON.parse(goalString);
    
    // Если дата цели больше или равна целевой дате, добавляем данные
    if (goal.date >= targetDate) {
      // Проверяем, есть ли уже такие данные, чтобы избежать дубликатов
      const isDuplicate = goal.goalData.some(data => 
        JSON.stringify(data) === JSON.stringify(newGoalData)
      );
      
      if (!isDuplicate) {
        goal.goalData.push(newGoalData);
      }
    }
    
    return JSON.stringify(goal);
  });
}

// POST /api/saving-goals - добавить новую цель пользователю
export async function POST(request) {
  try {
    const { userId, goalData, targetDate } = await request.json();
    
    // Ищем пользователя по telegramId
    const user = await prisma.user.findUnique({
      where: { telegramId: userId }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    let updatedGoals;
    
    if (!user.savingGoals || user.savingGoals.length === 0) {
      updatedGoals = create30DaysGoals(goalData);
    } else {
      const targetDateToUse = targetDate || new Date().toISOString().split('T')[0];
      updatedGoals = updateGoalsFromDate(user.savingGoals, targetDateToUse, goalData);
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        savingGoals: updatedGoals
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }
    
    // Ищем пользователя по telegramId
    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    // Преобразуем строки JSON обратно в объекты
    const goalsObjects = user.savingGoals.map(goalString => {
      try {
        return JSON.parse(goalString);
      } catch (parseError) {
        console.error('Ошибка парсинга цели:', goalString, parseError);
        return {}; // Возвращаем пустой объект в случае ошибки парсинга
      }
    });
    
    return NextResponse.json({ success: true, savingGoals: goalsObjects });
  } catch (error) {
    console.error('Ошибка при получении целей:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId, goalsArray } = await request.json();
    
    // Ищем пользователя по telegramId
    const user = await prisma.user.findUnique({
      where: { telegramId: userId }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    const goalsStrings = goalsArray.map(goal => JSON.stringify(goal));
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
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
    const index = parseInt(searchParams.get('index'));
    
    if (!userId || isNaN(index)) {
      return NextResponse.json({ success: false, error: 'userId and valid index are required' }, { status: 400 });
    }
    
    // Ищем пользователя по telegramId
    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
      select: { savingGoals: true }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    // Создаем новый массив без элемента по указанному индексу
    const newGoals = user.savingGoals.filter((_, i) => i !== index);
    
    // Обновляем массив savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
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