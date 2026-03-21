import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
      select: { language: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ language: user.language });
  } catch (error) {
    console.error('Error in /api/users/language:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
