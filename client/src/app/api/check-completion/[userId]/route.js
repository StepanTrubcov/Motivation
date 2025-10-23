import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    
    // Получаем все цели пользователя
    const goals = await prisma.goal.findMany({ 
      where: { userId: String(userId) } 
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Проверяем только цели, которые могут нуждаться в обновлении
    const goalsToUpdate = [];
    const updatedGoals = [];

    for (const goal of goals) {
      let updatedGoal = { ...goal };
      let needsUpdate = false;

      if (goal.status === 'in_progress' && goal.startDate) {
        const startDate = new Date(goal.startDate);
        const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        
        // Сбрасываем статус только если прошло больше 30 дней
        if (daysDiff >= 30) {
          updatedGoal = {
            ...goal,
            status: 'not_started',
            startDate: null,
            completionDate: null
          };
          needsUpdate = true;
        }
      }
      else if (goal.status === 'completed' && goal.completionDate) {
        const completionDate = new Date(goal.completionDate);
        
        // Переводим в статус in_progress только если дата завершения была вчера или раньше
        if (completionDate < startOfToday) {
          updatedGoal = {
            ...goal,
            status: 'in_progress',
            completionDate: null
          };
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        goalsToUpdate.push({
          id: String(goal.id),
          data: updatedGoal
        });
        updatedGoals.push(updatedGoal);
      } else {
        updatedGoals.push(goal);
      }
    }

    // Обновляем только те цели, которые действительно нуждаются в обновлении
    for (const goalToUpdate of goalsToUpdate) {
      await prisma.goal.update({
        where: { id: goalToUpdate.id },
        data: {
          status: goalToUpdate.data.status,
          startDate: goalToUpdate.data.startDate,
          completionDate: goalToUpdate.data.completionDate
        }
      });
    }

    return NextResponse.json(updatedGoals);
  } catch (error) {
    console.error('Error in /api/check-completion/:userId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}