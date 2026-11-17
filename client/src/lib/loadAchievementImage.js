import { loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { resolveAchievementImage } from './achievementImages';

export function loadAchievementImage(source) {
  const resolved = resolveAchievementImage(source);
  if (resolved.startsWith('/Image/achievements/')) {
    // Only known asset names can be loaded from the filesystem.
    if (!/^\/Image\/achievements\/(?:achievement-(?:[1-9]|[12][0-9]|3[0-5])(?:-v2)?|rare-(?:1[0-9]|2[0-2])-v1|legendary-2[3-6]-v1|epic-27-v1)\.webp$/.test(resolved)) {
      throw new Error('Invalid achievement image path');
    }
    return loadImage(path.join(process.cwd(), 'public', resolved.slice(1)));
  }
  // Current achievements all have local assets. Never fetch a caller-supplied URL or filesystem path.
  throw new Error('Unknown achievement image');
}
