import { readSnapshot } from '@/lib/progress/readSnapshot.mjs';
import { readUser, publicUser } from '@/lib/progress/store.mjs';
import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const telegramId = new URL(request.url).searchParams.get('telegramId');
    if (!telegramId) return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    const user = await readSnapshot(prisma, tx => readUser(tx, { telegramId: String(telegramId) }));
    return NextResponse.json(publicUser(user) || { error: 'User not found' }, { status: user ? 200 : 404 });
  } catch { return NextResponse.json({ error: 'Не удалось загрузить профиль' }, { status: 500 }); }
}
export async function POST(request) {
  try {
    const body = await request.json();
    const telegramId = body.telegramId != null ? String(body.telegramId) : '';
    if (!/^[1-9]\d{0,19}$/.test(telegramId)) return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    const data = {
      firstName: typeof body.firstName === 'string' ? body.firstName : null,
      username: typeof body.username === 'string' ? body.username : null,
      photoUrl: typeof body.photoUrl === 'string' ? body.photoUrl : null,
    };
    const user = await prisma.user.upsert({ where: { telegramId },
      create: { telegramId, ...data, storageVersion: 1, progressMeta: { onboardingStage: 'language', goalCatalog: 'standard-v1', achievementCatalog: 'v2', achievementsInitialized: false, calendar: { ranges: [], extras: {} } }, usersTag: typeof body.usersTag === 'string' ? body.usersTag.slice(0, 40) : null, savingGoals: [] },
      update: data });
    // Repair missing legacy registration dates without deleting their goals or achievements.
    if (!user.registrationDate) {
      await prisma.user.update({ where: { id: user.id }, data: { registrationDate: user.createdAt } });
    }
    return NextResponse.json(publicUser(await readSnapshot(prisma, tx => readUser(tx, { id: user.id }))));
  } catch (error) {
    console.error('Profile initialization failed:', error);
    return NextResponse.json({ error: 'Не удалось загрузить профиль' }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const { telegramId, language } = await request.json();
    if (telegramId == null || String(telegramId).trim() === '') return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    const value = ['ru', 'rus'].includes(language) ? 'rus' : ['en', 'ang'].includes(language) ? 'ang' : null;
    if (!value) return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    const user = await prisma.user.update({ where: { telegramId: String(telegramId) }, data: { language: value } });
    return NextResponse.json({ success: true, user: publicUser(await readSnapshot(prisma, tx => readUser(tx, { id: user.id }))) });
  } catch { return NextResponse.json({ error: 'Не удалось сохранить язык' }, { status: 500 }); }
}

export async function PATCH(request) {
  try {
    const { telegramId, stage, language } = await request.json();
    if (telegramId == null || String(telegramId).trim() === '') return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    if (!['welcome','tutorial-offer','tutorial','rewards','done'].includes(stage)) return NextResponse.json({error:'Invalid stage'},{status:400});
    const user = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE "telegramId" = ${String(telegramId)} FOR UPDATE`;
      const current = await tx.user.findUnique({where:{telegramId: String(telegramId)}});
      if (!current) return null;
      return tx.user.update({where:{id:current.id},data:{progressMeta:{...(current.progressMeta || {}),onboardingStage:stage},...(['ru','en'].includes(language)?{language:language === 'en'?'ang':'rus'}:{})}});
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({success:true,stage:user.progressMeta.onboardingStage});
  } catch { return NextResponse.json({error:'Could not save onboarding'},{status:500}); }
}
