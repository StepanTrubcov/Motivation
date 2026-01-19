import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('Fetching all user IDs from database');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                telegramId: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`Found ${users.length} users`);

        const userIds = users.map(user => ({
            id: user.id,
            telegramId: user.telegramId
        }));

        return NextResponse.json(userIds);
    } catch (error) {
        console.error('Error fetching user IDs:', error);
        return NextResponse.json({ error: 'Не удалось получить ID пользователей' }, { status: 500 });
    }
}