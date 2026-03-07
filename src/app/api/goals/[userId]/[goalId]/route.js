import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { userId, goalId } = await params;
    const requestData = await request.json();
    const { newStatus } = requestData;
    const selectedOption = requestData.selectedOption;

    console.log('PUT request data:', { userId, goalId, newStatus, selectedOption });
    console.log('Type of selectedOption:', typeof selectedOption);

    if (!newStatus) {
      console.log('newStatus is missing');
      return NextResponse.json({ error: 'newStatus is required' }, { status: 400 });
    }

    console.log('Finding goal...');
    const goal = await prisma.goal.findFirst({
      where: { id: String(goalId), userId: String(userId) }
    });

    if (!goal) {
      console.log('Goal not found');
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    console.log('Found goal:', goal);

    let statusValue;
    let updateData = {};

    switch (newStatus) {
      case 'done':
        statusValue = 'completed';
        updateData = {
          status: statusValue,
          completionDate: new Date(),
          progress: { increment: 1 },
        };
        if (!goal.startDate) {
          updateData.startDate = new Date();
        }
        break;
      case 'in_progress':
        statusValue = newStatus;
        updateData = {
          status: statusValue,
          startDate: goal.startDate || new Date(),
          progress: { increment: -1 }
        };
        // Добавляем selectedOption, если он передан
        if (selectedOption !== undefined && selectedOption !== null) {
          // Проверяем, что selectedOption является числом
          if (typeof selectedOption === 'number' && Number.isInteger(selectedOption) && selectedOption >= 0) {
            console.log('Setting selectedOption to:', selectedOption);
            updateData.selectedOption = selectedOption;
          } else {
            console.warn('Invalid selectedOption value:', selectedOption, 'Type:', typeof selectedOption);
            return NextResponse.json({ error: 'Invalid selectedOption value' }, { status: 400 });
          }
        }
        break;
      case 'not_started':
        statusValue = newStatus;
        updateData = {
          status: statusValue,
          startDate: null,
          completionDate: null,
          progress: 0,
          selectedOption: 0,
        };
        // Сбрасываем selectedOption только если он был установлен
        if (goal.selectedOption !== null && goal.selectedOption !== undefined) {
          updateData.selectedOption = 0;
        }
        break;
      default:
        console.log('Invalid status value:', newStatus);
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    console.log('Update data:', updateData);

    const updatedGoal = await prisma.goal.update({
      where: { id: String(goalId) },
      data: updateData,
    });

    console.log('Updated goal:', updatedGoal);
    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error(`Error updating goal status:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}