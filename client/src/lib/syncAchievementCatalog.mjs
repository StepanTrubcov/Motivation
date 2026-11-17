import { ensureCompactAchievements } from './progress/initialize.mjs';
import { ACHIEVEMENT_TEMPLATES } from './achievementTemplates.mjs';
import { isFirstHundred } from './achievementEligibility.mjs';
export async function syncAchievementCatalog(db, userId) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(async tx => {
        const owner = await tx.user.findUnique({ where: { id: userId } });
        if (owner?.storageVersion === 1) return ensureCompactAchievements(tx, userId);
        const first100 = await isFirstHundred(tx, userId);
        const current = await tx.achievement.findMany({ where: { userId } });
        const results = [];
        const retained = [];
        for (const template of ACHIEVEMENT_TEMPLATES) {
          const templateId = `v2:${template.id}`;
          const old = current.find(a => a.templateId === templateId)
            || current.find(a => a.title === template.title && a.type === template.type);
          const automaticallyEarned = template.id === '1' || template.id === '27' && first100;
          const earned = old?.status === 'my' || automaticallyEarned;
          const data = { ...template, templateId, userId, status: earned ? 'my' : 'locked',
            earnedAt: earned ? old?.earnedAt || (old?.status === 'my' ? old.updatedAt : null) || new Date() : null, points: 0 };
          delete data.id;
          const row = old ? await tx.achievement.update({ where: { id: old.id }, data }) : await tx.achievement.create({ data });
          retained.push(row.id);
          results.push(row);
        }
        await tx.achievement.deleteMany({ where: { userId, id: { notIn: retained } } });
        return results;
      }, { isolationLevel: 'Serializable', timeout: 30000, maxWait: 5000 });
    } catch (error) { if (['P2034', 'P2002'].includes(error.code) && attempt < 3) continue; throw error; }
  }
}
