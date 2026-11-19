import { compact, readAchievements, awardAchievement, readUser } from './store.mjs';
import { isFirstHundred } from '../achievementEligibility.mjs';
export async function ensureCompactAchievements(tx, userId) {
  let user = await readUser(tx, { id: userId }, { calendar: false });
  if (!compact(user)) throw new Error('User is not using compact storage');
  const currentMeta = user.progressMeta || {};
  const { achievementIds, ...metadataWithoutLegacyIds } = currentMeta;
  const needsCatalogMigration = currentMeta.achievementCatalog !== 'v2' || achievementIds != null;
  if (needsCatalogMigration) {
    user = await tx.user.update({ where: { id: userId }, data: { progressMeta: {
      ...metadataWithoutLegacyIds,
      achievementCatalog: 'v2',
      achievementsInitialized: false,
    } } });
  }

  const currentAchievements = await readAchievements(tx, userId, user);
  const currentTemplateIds = currentAchievements.map(achievement => achievement.templateId);
  await tx.earnedAchievement.deleteMany({ where: { userId, templateId: { notIn: currentTemplateIds } } });
  // Compact users should never need duplicated achievement definitions.
  await tx.achievement.deleteMany({ where: { userId } });

  if (!user.progressMeta?.achievementsInitialized) {
    const first100 = await isFirstHundred(tx, userId);
    for (const achievement of currentAchievements) {
      if (achievement.templateId === 'v2:1' || achievement.templateId === 'v2:27' && first100) await awardAchievement(tx, user, achievement);
    }
    user = await tx.user.update({ where: { id: userId }, data: { progressMeta: { ...user.progressMeta, achievementsInitialized: true } } });
  }
  return readAchievements(tx, userId, user);
}
