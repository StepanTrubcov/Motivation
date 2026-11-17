const sessionStages = new Map();
export const onboardingStorageKey = userId => `app-onboarding:v2:${encodeURIComponent(userId)}`;
const STAGES = new Set(['language', 'welcome', 'rewards', 'tutorial-offer', 'tutorial', 'done']);
export function readOnboardingStage(user, goals, storage) {
  if (!user?.id) return null;
  return user.onboardingStage === 'tutorial' ? 'tutorial-offer' : user.onboardingStage || 'done';
}
export function saveOnboardingStage(userId, stage, storage) {
  if (!userId || !STAGES.has(stage)) return;
  const key = onboardingStorageKey(userId);
  sessionStages.set(key, stage);
  try { storage?.setItem(key, stage); } catch {}
}

export function findTutorialAchievement(achievements) {
  const list = Array.isArray(achievements) ? achievements : [];
  return list.find(item => item?.templateId === 'v2:2') ||
    list.find(item => String(item?.templateId || '') === '27') ||
    list.find(item => String(item?.id || '') === '27') ||
    list.find(item => (item?.title || '').trim() === 'В игре');
}
