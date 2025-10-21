import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { amount } = await request.json();

    const inc = Number(amount);
    if (!id) {
      return NextResponse.json({ error: 'id is required in params' }, { status: 400 });
    }
    if (!Number.isInteger(inc) || inc <= 0) {
      return NextResponse.json({ error: 'amount must be a positive integer' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: String(id) },
      data: { pts: { increment: inc } }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        telegramId: updated.telegramId,
        pts: updated.pts
      }
    });
  } catch (error) {
    console.error('Error incrementing pts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
