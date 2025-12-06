import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

function removeGoalFromDate(goals, startDate, goalId) {
  return goals.map(goal => {
    if (goal.date >= startDate) {
      const filteredGoalData = goal.goalData.filter(data => data.idGoals !== goalId);
      return {
        ...goal,
        goalData: filteredGoalData
      };
    }
    return goal;
  });
}

function removeGoalFromToday(goals, goalId) {
  const today = new Date().toISOString().split('T')[0];
  return removeGoalFromDate(goals, today, goalId);
}

export async function POST(request) {
  try {
    const { userId, goalId } = await request.json();
    
    console.log('=== НАЧАЛО УДАЛЕНИЯ ЦЕЛИ С СЕГОДНЯШНЕЙ ДАТЫ ===');
    console.log('Полученные параметры:', { userId, goalId });

    // Ищем пользователя по telegramId
    const user = await prisma.user.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      console.log('Пользователь не найден:', userId);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    console.log('Найден пользователь:', user.id);
    console.log('Текущие savingGoals:', JSON.stringify(user.savingGoals, null, 2));

    // Удаляем цель начиная с сегодняшней даты и во всех последующих днях
    const updatedSavingGoals = removeGoalFromToday(user.savingGoals, goalId);
    
    console.log('Обновленные savingGoals:', JSON.stringify(updatedSavingGoals, null, 2));

    // Обновляем пользователя с новыми savingGoals
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        savingGoals: updatedSavingGoals
      },
      select: {
        id: true,
        telegramId: true,
        savingGoals: true
      }
    });
    
    console.log('Пользователь успешно обновлен:', updatedUser);
    console.log('=== КОНЕЦ УДАЛЕНИЯ ЦЕЛИ С СЕГОДНЯШНЕЙ ДАТЫ ===');

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Ошибка при удалении цели с сегодняшней даты:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}