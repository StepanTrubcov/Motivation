import { ensureCompactAchievements } from './progress/initialize.mjs';
import { PrismaClient } from '@prisma/client';
import { ACHIEVEMENT_TEMPLATES, validateAchievementTemplates } from './achievementTemplates.mjs';

const prisma = new PrismaClient();

function sameMeaning(row, template) {
  return String(row.title || '').trim() === template.title.trim() &&
    (row.target == null ? null : Number(row.target)) === (template.target == null ? null : Number(template.target)) &&
    (row.type || null) === (template.type || null) &&
    JSON.stringify((row.goalIds || []).map(String).sort()) === JSON.stringify((template.goalIds || []).map(String).sort());
}

function recordFor(template, userId, status, earnedAt) {
  return {
    templateId: `v2:${template.id}`, title: template.title,
    description: template.description || '', requirement: template.requirement || '',
    status, earnedAt: status === 'my' ? (earnedAt || new Date()) : null,
    image: template.image, gif: template.gif || '', points: 0,
    rarity: template.rarity || 'common', type: template.type || null,
    goalIds: template.goalIds || [], target: template.target == null ? null : Number(template.target), userId,
  };
}

export async function updateAllUserAchievements() {
  validateAchievementTemplates();
  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    let synced = 0;
    for (const { id: userId } of users) {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user?.storageVersion === 1) { await ensureCompactAchievements(tx, userId); return; }
        const current = await tx.achievement.findMany({ where: { userId } });
        const retained = new Map();
        const claimed = new Set();
        for (const template of ACHIEVEMENT_TEMPLATES) {
          const match = current.find((row) => !claimed.has(row.id) && sameMeaning(row, template));
          if (match) { retained.set(String(template.id), match); claimed.add(match.id); }
        }
        await tx.achievement.deleteMany({ where: { userId, id: { notIn: [...claimed] } } });
        for (const template of ACHIEVEMENT_TEMPLATES) {
          const old = retained.get(String(template.id));
          const status = old?.status === 'my' ? 'my' : (template.status || 'locked');
          const earnedAt = status === 'my' ? old?.earnedAt || (old?.status === 'my' ? old.updatedAt : null) : null;
          const data = recordFor(template, userId, status, earnedAt);
          if (old) await tx.achievement.update({ where: { id: old.id }, data });
          else await tx.achievement.create({ data });
        }
      }, { timeout: 120000 });
      synced += 1;
    }
    return { success: true, message: `Синхронизировано пользователей: ${synced} из ${users.length}` };
  } finally {
    await prisma.$disconnect();
  }
}
