import { prismaPostgres } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    const { goalsArray } = await request.json();

    if (!goalsArray || !Array.isArray(goalsArray)) {
      return NextResponse.json({ error: 'goalsArray must be an array' }, { status: 400 });
    }

    for (const goal of goalsArray) {
      if (!goal.id || !goal.title || !goal.points || !goal.status || !goal.description) {
        return NextResponse.json({ error: `Invalid goal data: ${JSON.stringify(goal)}` }, { status: 400 });
      }

      let statusValue;
      switch (goal.status) {
        case 'done': 
          statusValue = 'completed'; 
          break;
        case 'in_progress':
        case 'not_started': 
          statusValue = goal.status; 
          break;
        default:
          return NextResponse.json({ error: `Invalid status value: ${goal.status}` }, { status: 400 });
      }

      const uniqueGoalId = `${userId}_${goal.id}`;

      await prismaPostgres.goal.upsert({
        where: { id: uniqueGoalId },
        update: {
          title: goal.title,
          points: goal.points,
          status: statusValue,
          completionDate: goal.completionDate ? new Date(goal.completionDate) : null,
          description: goal.description,
          userId: String(userId),
          startDate: goal.startDate ? new Date(goal.startDate) : null,
          progress: goal.progress || 0,
        },
        create: {
          id: uniqueGoalId,
          title: goal.title,
          points: goal.points,
          status: statusValue,
          completionDate: goal.completionDate ? new Date(goal.completionDate) : null,
          description: goal.description,
          userId: String(userId),
          startDate: goal.startDate ? new Date(goal.startDate) : null,
          progress: goal.progress || 0,
        },
      });
    }

    return NextResponse.json({ message: 'Goals initialized' });
  } catch (error) {
    console.error('Error in /api/initialize-goals/:userId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
