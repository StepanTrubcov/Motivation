import { compact, readAchievements, awardAchievement, readUser } from './store.mjs';
import { isFirstHundred } from '../achievementEligibility.mjs';
export async function ensureCompactAchievements(tx, userId) {
  let user = await readUser(tx, { id: userId }, { calendar: false });
  if (!compact(user)) throw new Error('User is not using compact storage');
  if (!user.progressMeta?.achievementsInitialized) {
    const first100 = await isFirstHundred(tx, userId);
    for (const achievement of await readAchievements(tx, userId, user)) {
      if (achievement.templateId === 'v2:1' || achievement.templateId === 'v2:27' && first100) await awardAchievement(tx, user, achievement);
    }
    user = await tx.user.update({ where: { id: userId }, data: { progressMeta: { ...user.progressMeta, achievementsInitialized: true } } });
  }
  return readAchievements(tx, userId, user);
}
