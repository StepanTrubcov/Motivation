import images from './achievement-images.json';
import rareImages from './rare-achievement-images.json';
import legendaryImages from './legendary-achievement-images.json';
import epicImages from './epic-achievement-images.json';

const updatedImages = [...rareImages, ...legendaryImages, ...epicImages];

const localByLegacyUrl = new Map(images.map(({ legacyImage, image }) => [legacyImage, image]));
const updatedByTemplate = new Map(updatedImages.map(item => [item.templateId, item.image]));
const updatedPaths = new Set(updatedImages.map(item => item.image));
// Only unambiguous old assets can be replaced by URL alone. Several achievements
// used the same goal icon; their artwork must instead be selected by v2 template ID.
const uniqueOldImages = new Map(updatedImages
  .filter(item => updatedImages.filter(other => other.previousImage === item.previousImage).length === 1)
  .map(item => [item.previousImage, item.image]));

export function resolveAchievementImage(image, achievement) {
  const templateId = achievement?.templateId || (
    ['rare', 'legendary', 'epic'].includes(achievement?.rarity) && /^\d+$/.test(String(achievement?.id || ''))
      ? `v2:${achievement.id}` : null
  );
  const byTemplate = updatedByTemplate.get(templateId);
  if (byTemplate) return byTemplate;
  const local = localByLegacyUrl.get(image) || image || '';
  return uniqueOldImages.get(local) || local;
}

export function decorateAchievementArtwork(achievement) {
  const image = resolveAchievementImage(achievement.image, achievement);
  // Old animations depict the previous artwork. The replacement illustrations are static.
  return { ...achievement, image, ...(updatedPaths.has(image) ? { gif: '' } : {}) };
}
