import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { buildInitialGoalRecords } from '@/lib/initializeGoalRecords.mjs';
import { TEMPLATE_GOALS_ARRAY } from '@/lib/goalCatalog.mjs';
import { TEST_CATALOG_USER_ID, TEST_GOALS } from '@/lib/testGoalCatalog';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, storageVersion: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.storageVersion === 1) return NextResponse.json({ message: "Shared catalog ready", created: 0 });
    const catalog = userId === TEST_CATALOG_USER_ID ? TEST_GOALS : TEMPLATE_GOALS_ARRAY;
    const records = buildInitialGoalRecords(userId, catalog);
    const result = await prisma.goal.createMany({ data: records, skipDuplicates: true });
    return NextResponse.json({ message: 'Goals initialized', created: result.count });
  } catch (error) {
    console.error('Goal catalog initialization failed:', error);
    return NextResponse.json({ error: 'Не удалось создать каталог целей' }, { status: 500 });
  }
}
