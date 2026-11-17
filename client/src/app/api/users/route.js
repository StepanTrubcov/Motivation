import { readSnapshot } from '@/lib/progress/readSnapshot.mjs';
import { readUser, publicUser } from '@/lib/progress/store.mjs';
import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { requestIdentity } from '@/lib/telegramAuth.mjs';

export async function GET(request) {
  const identity = requestIdentity(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const user = await readSnapshot(prisma, tx => readUser(tx, { telegramId: identity.telegramId }));
    return NextResponse.json(publicUser(user) || { error: 'User not found' }, { status: user ? 200 : 404 });
  } catch { return NextResponse.json({ error: 'Не удалось загрузить профиль' }, { status: 500 }); }
}
export async function POST(request) {
  const identity = requestIdentity(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const data = { firstName: identity.first_name, username: identity.username || null, photoUrl: identity.photo_url || null };
    const user = await prisma.user.upsert({ where: { telegramId: identity.telegramId },
      create: { telegramId: identity.telegramId, ...data, storageVersion: 1, progressMeta: { onboardingStage: 'language', goalCatalog: 'standard-v1', achievementCatalog: 'v2', achievementsInitialized: false, calendar: { ranges: [], extras: {} } }, usersTag: typeof body.usersTag === 'string' ? body.usersTag.slice(0, 40) : null, savingGoals: [] },
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
  const identity = requestIdentity(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { language } = await request.json();
    const value = ['ru', 'rus'].includes(language) ? 'rus' : ['en', 'ang'].includes(language) ? 'ang' : null;
    if (!value) return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    const user = await prisma.user.update({ where: { telegramId: identity.telegramId }, data: { language: value } });
    return NextResponse.json({ success: true, user: publicUser(await readSnapshot(prisma, tx => readUser(tx, { id: user.id }))) });
  } catch { return NextResponse.json({ error: 'Не удалось сохранить язык' }, { status: 500 }); }
}

export async function PATCH(request) {
  const identity = requestIdentity(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { stage, language } = await request.json();
    if (!['welcome','tutorial-offer','tutorial','rewards','done'].includes(stage)) return NextResponse.json({error:'Invalid stage'},{status:400});
    const user = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE "telegramId" = ${identity.telegramId} FOR UPDATE`;
      const current = await tx.user.findUnique({where:{telegramId:identity.telegramId}});
      return tx.user.update({where:{id:current.id},data:{progressMeta:{...(current.progressMeta || {}),onboardingStage:stage},...(['ru','en'].includes(language)?{language:language === 'en'?'ang':'rus'}:{})}});
    });
    return NextResponse.json({success:true,stage:user.progressMeta.onboardingStage});
  } catch { return NextResponse.json({error:'Could not save onboarding'},{status:500}); }
}
