import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    const goals = await prisma.goal.findMany({ 
      where: { userId: String(userId) } 
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error in /api/goals/:userId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
