import images from './achievement-images.json' with { type: 'json' };
import rareImages from './rare-achievement-images.json' with { type: 'json' };
import legendaryImages from './legendary-achievement-images.json' with { type: 'json' };
import epicImages from './epic-achievement-images.json' with { type: 'json' };
import { ACHIEVEMENT_TEMPLATES } from './achievementTemplates.mjs';

const updatedImages = [...rareImages, ...legendaryImages, ...epicImages];
const currentByTemplate = new Map(ACHIEVEMENT_TEMPLATES.map(item => [`v2:${item.id}`, item]));
const artworkVersion = '20261119';

const localByLegacyUrl = new Map(images.map(({ legacyImage, image }) => [legacyImage, image]));
const updatedByTemplate = new Map(updatedImages.map(item => [item.templateId, item.image]));
const updatedPaths = new Set(updatedImages.map(item => item.image));
// Only unambiguous old assets can be replaced by URL alone. Several achievements
// used the same goal icon; their artwork must instead be selected by v2 template ID.
const uniqueOldImages = new Map(updatedImages
  .filter(item => updatedImages.filter(other => other.previousImage === item.previousImage).length === 1)
  .map(item => [item.previousImage, item.image]));

const normalizeTitle = value => String(value || '').trim().toLocaleLowerCase('ru');
const normalizeGoalIds = value => [...(value || [])].map(String).sort();

function legacyTemplateFor(achievement) {
  const title = normalizeTitle(achievement?.title);
  const goals = normalizeGoalIds(achievement?.goalIds);
  let candidates = ACHIEVEMENT_TEMPLATES.filter(item => normalizeTitle(item.title) === title);

  if (achievement?.type) {
    const sameType = candidates.filter(item => item.type === achievement.type);
    if (sameType.length) candidates = sameType;
  }

  if (goals.length) {
    const sameGoals = candidates.filter(item => JSON.stringify(normalizeGoalIds(item.goalIds)) === JSON.stringify(goals));
    if (sameGoals.length) candidates = sameGoals;
    else {
      const overlappingGoals = ACHIEVEMENT_TEMPLATES.filter(item =>
        item.type === 'goal_based' && (item.goalIds || []).some(id => goals.includes(String(id))));
      if (overlappingGoals.length) candidates = overlappingGoals;
    }
  }

  if (!candidates.length && achievement?.type) {
    candidates = ACHIEVEMENT_TEMPLATES.filter(item => item.type === achievement.type);
    // Old usage milestones were replaced by the flame streak milestones.
    if (!candidates.length && achievement.type === 'time_based') {
      candidates = ACHIEVEMENT_TEMPLATES.filter(item => item.type === 'streak_based');
    }
  }

  if (!candidates.length && achievement?.rarity) {
    candidates = ACHIEVEMENT_TEMPLATES.filter(item => item.rarity === achievement.rarity);
  }
  if (!candidates.length) return null;

  const target = Number(achievement?.target);
  if (achievement?.type === 'time_based' && Number.isFinite(target) && target > 0) {
    const streakCandidates = ACHIEVEMENT_TEMPLATES.filter(item => item.type === 'streak_based');
    const nearestTarget = list => Math.min(...list.map(item => Math.abs(Number(item.target || 0) - target)));
    if (streakCandidates.length && nearestTarget(streakCandidates) < nearestTarget(candidates)) candidates = streakCandidates;
  }
  if (Number.isFinite(target) && target > 0) {
    candidates.sort((a, b) => Math.abs(Number(a.target || 0) - target) - Math.abs(Number(b.target || 0) - target));
  }
  return candidates[0];
}

export function resolveAchievementImage(image, achievement) {
  const templateId = String(achievement?.templateId || '');
  if (templateId.startsWith('v2:')) {
    const current = currentByTemplate.get(templateId);
    if (current?.image) return current.image;
  } else if (!templateId && /^\d+$/.test(String(achievement?.id || ''))) {
    const current = currentByTemplate.get(`v2:${achievement.id}`);
    if (current?.image) return current.image;
  }

  if (achievement) {
    const current = legacyTemplateFor(achievement);
    if (current?.image) return current.image;
  }

  const inferredTemplate = !templateId && ['rare', 'legendary', 'epic'].includes(achievement?.rarity)
    && /^\d+$/.test(String(achievement?.id || '')) ? `v2:${achievement.id}` : null;
  const byTemplate = updatedByTemplate.get(inferredTemplate);
  if (byTemplate) return byTemplate;
  const local = localByLegacyUrl.get(image) || image || '';
  return uniqueOldImages.get(local) || local;
}

export function decorateAchievementArtwork(achievement) {
  const image = resolveAchievementImage(achievement.image, achievement);
  const isLegacyTemplate = achievement.templateId && !String(achievement.templateId).startsWith('v2:');
  // Old catalog animations depict retired artwork. New catalog art is static.
  return { ...achievement, image, ...(isLegacyTemplate || updatedPaths.has(image) ? { gif: '' } : {}) };
}

export function achievementImageSrc(image, achievement) {
  const resolved = resolveAchievementImage(image, achievement);
  if (!resolved.startsWith('/Image/achievements/')) return resolved;
  return `${resolved}?v=${artworkVersion}`;
}
