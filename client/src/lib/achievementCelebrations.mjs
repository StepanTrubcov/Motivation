const memory = new Map();
export const celebrationStorageKey = userId => `achievement-celebrations:v1:${encodeURIComponent(userId)}`;
export function achievementCelebrationId(achievement) {
  if (!achievement?.id && !achievement?.templateId) return null;
  return `${achievement.templateId || achievement.id}:${achievement.earnedAt || ''}`;
}
export function readSeenAchievements(userId, storage) {
  if (!userId) return new Set();
  const key = celebrationStorageKey(userId);
  let stored = [];
  try {
    const value = JSON.parse(storage?.getItem(key) || '[]');
    if (Array.isArray(value)) stored = value.filter(id => typeof id === 'string');
  } catch { /* Keep pending rewards visible if storage is unavailable. */ }
  return new Set([...stored, ...(memory.get(key) || [])]);
}
export function acknowledgeAchievement(userId, achievement, storage) {
  const seen = readSeenAchievements(userId, storage);
  const id = achievementCelebrationId(achievement);
  if (!userId || !id) return seen;
  seen.add(id);
  const key = celebrationStorageKey(userId);
  memory.set(key, seen);
  try { storage?.setItem(key, JSON.stringify([...seen])); } catch {}
  return seen;
}
export function pendingAchievements(achievements, seen = new Set()) {
  const unique = new Set();
  return (Array.isArray(achievements) ? achievements : []).filter(achievement => {
    const id = achievementCelebrationId(achievement);
    if (achievement?.status !== 'my' || !id || seen.has(id) || unique.has(id)) return false;
    unique.add(id);
    return true;
  }).sort((a, b) => {
    const priority = item => ({ 'v2:1': 0, 'v2:27': 1, 'v2:2': 2 })[item.templateId] ?? 3;
    return priority(a) - priority(b) || (Date.parse(a.earnedAt) || 0) - (Date.parse(b.earnedAt) || 0);
  });
}
