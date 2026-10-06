import images from './achievement-images.json';

const localByLegacyUrl = new Map(images.map(({ legacyImage, image }) => [legacyImage, image]));

// Match exact old URLs, never translated titles or ambiguous legacy template IDs.
export function resolveAchievementImage(image) {
  return localByLegacyUrl.get(image) || image || '';
}
