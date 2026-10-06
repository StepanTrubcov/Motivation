import { loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { resolveAchievementImage } from './achievementImages';

export function loadAchievementImage(source) {
  const resolved = resolveAchievementImage(source);
  if (resolved.startsWith('/Image/achievements/')) {
    // Only known asset names can be loaded from the filesystem.
    if (!/^\/Image\/achievements\/achievement-(?:[1-9]|[12][0-9]|3[01])\.webp$/.test(resolved)) {
      throw new Error('Invalid achievement image path');
    }
    return loadImage(path.join(process.cwd(), 'public', resolved.slice(1)));
  }
  return loadImage(resolved);
}
