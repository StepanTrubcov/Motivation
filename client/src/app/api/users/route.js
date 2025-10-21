import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { telegramId, firstName, username, photoUrl } = await request.json();

    let user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (user) {
      if (!user.registrationDate) {
        await prisma.achievement.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });

        user = await prisma.user.create({
          data: {
            telegramId: String(telegramId),
            firstName,
            username,
            photoUrl,
            registrationDate: new Date(),
          },
        });
      } else {
        user = await prisma.user.update({
          where: { telegramId: String(telegramId) },
          data: { firstName, username, photoUrl },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          telegramId: String(telegramId),
          firstName,
          username,
          photoUrl,
          registrationDate: new Date(),
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in /api/users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
