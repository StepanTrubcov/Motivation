import { prismaPostgres } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    const goals = await prismaPostgres.goal.findMany({ 
      where: { userId: String(userId) } 
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const updatedGoals = await Promise.all(
      goals.map(async (goal) => {
        // Цели в статусе "in_progress" проверяем на 30 дней
        if (goal.status === 'in_progress' && goal.startDate) {
          const startDate = new Date(goal.startDate);
          const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 30) {
            await prismaPostgres.goal.update({
              where: { id: String(goal.id) },
              data: {
                status: 'not_started',
                startDate: null,
                completionDate: null,
              },
            });
            return { ...goal, status: 'not_started', startDate: null, completionDate: null };
          }
        }
        // Цели в статусе "completed" проверяем относительно начала дня
        else if (goal.status === 'completed' && goal.completionDate) {
          const completionDate = new Date(goal.completionDate);
          
          if (completionDate < startOfToday) {
            await prismaPostgres.goal.update({
              where: { id: String(goal.id) },
              data: {
                status: 'in_progress',
                completionDate: null,
              },
            });
            return { ...goal, status: 'in_progress', completionDate: null };
          }
        }

        return goal;
      })
    );

    return NextResponse.json(updatedGoals);
  } catch (error) {
    console.error('Error in /api/check-completion/:userId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
