import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { commitGoalCompletion } from '@/lib/goalCompletion.mjs';

export async function POST(request, { params }) {
    try {
        const { userId, goalId } = await params;
        const { action, requestId, date } = await request.json();
        if (!['complete', 'undo'].includes(action) || typeof requestId !== 'string' || !/^[\w-]{16,100}$/.test(requestId)) {
            return NextResponse.json({ error: 'Invalid completion request' }, { status: 400 });
        }
        return NextResponse.json(await commitGoalCompletion(prisma, userId, goalId, action, requestId, date));
    } catch (error) {
        console.error('Goal completion failed:', error);
        return NextResponse.json({ error: 'Could not save goal completion' }, { status: error.status || (error.code === 'P2034' ? 503 : 500) });
    }
}
