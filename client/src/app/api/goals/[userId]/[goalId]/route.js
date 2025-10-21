import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { userId, goalId } = await params;
    const { newStatus } = await request.json();

    if (!newStatus) {
      return NextResponse.json({ error: 'newStatus is required' }, { status: 400 });
    }

    const goal = await prisma.goal.findFirst({ 
      where: { id: String(goalId), userId: String(userId) } 
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    let statusValue;
    switch (newStatus) {
      case 'done':
        statusValue = 'completed';
        break;
      case 'in_progress':
      case 'not_started':
        statusValue = newStatus;
        break;
      default:
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: String(goalId) },
      data: {
        status: statusValue,
        startDate: statusValue === 'in_progress' && !goal.startDate ? new Date() : goal.startDate,
        completionDate: statusValue === 'completed' ? new Date() : goal.completionDate,
        progress: statusValue === 'completed' ? { increment: 1 } : undefined,
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error(`Error updating goal status:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
