import inactive from '@/img/lights/v2/inactive.webp';
import level01 from '@/img/lights/v2/level-01.webp';
import level02 from '@/img/lights/v2/level-02.webp';
import level03 from '@/img/lights/v2/level-03.webp';
import level04 from '@/img/lights/v2/level-04.webp';
import level05 from '@/img/lights/v2/level-05.webp';
import level06 from '@/img/lights/v2/level-06.webp';
import level07 from '@/img/lights/v2/level-07.webp';
import level08 from '@/img/lights/v2/level-08.webp';
import level09 from '@/img/lights/v2/level-09.webp';
import level10 from '@/img/lights/v2/level-10.webp';
import frozen from '@/img/lights/v2/frozen-v1.webp';

export const GRAY_LIGHT_URL = inactive.src;
export const FROZEN_LIGHT_URL = frozen.src;

export const LEVELS_OF_LIGHTS = [
  { url: level01.src, celebrationColor: '#ff8533', daysMin: 2, daysMax: 9 },
  { url: level02.src, celebrationColor: '#ff9b28', daysMin: 10, daysMax: 19 },
  { url: level03.src, celebrationColor: '#ffad32', daysMin: 20, daysMax: 35 },
  { url: level04.src, celebrationColor: '#ffc43d', daysMin: 36, daysMax: 50 },
  { url: level05.src, celebrationColor: '#ffd34d', daysMin: 51, daysMax: 65 },
  { url: level06.src, celebrationColor: '#ff8c20', daysMin: 66, daysMax: 80 },
  { url: level07.src, celebrationColor: '#ff513a', daysMin: 81, daysMax: 95 },
  { url: level08.src, celebrationColor: '#ff7d97', daysMin: 96, daysMax: 110 },
  { url: level09.src, celebrationColor: '#ee63df', daysMin: 111, daysMax: 140 },
  { url: level10.src, celebrationColor: '#b47aff', daysMin: 141, daysMax: 190 },
];

// The same level determines both the flame illustration and its celebration palette.
export function getStreakCelebrationColor(num, imageUrl) {
  if (imageUrl === FROZEN_LIGHT_URL) return '#45b8ff';
  if (imageUrl === GRAY_LIGHT_URL) return '#aab1be';
  const matchedImage = imageUrl && LEVELS_OF_LIGHTS.find(level => level.url === imageUrl);
  if (matchedImage) return matchedImage.celebrationColor;
  const days = Number(num);
  if (!Number.isFinite(days) || days < 2) return '#aab1be';
  const level = LEVELS_OF_LIGHTS.find(level => days >= level.daysMin && days <= level.daysMax)
    || LEVELS_OF_LIGHTS[LEVELS_OF_LIGHTS.length - 1];
  return level.celebrationColor;
}
