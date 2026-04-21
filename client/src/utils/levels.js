export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3700, 4700,
  5800, 7000, 8300, 9700, 11200, 12800, 14500, 16300, 18200, 20200,
  22300, 24500, 26800, 29200, 31700, 34300, 37000, 39800, 42700, 45700,
  48800, 52000, 55300, 58700, 62200, 65800, 69500, 73300, 77200, 81200,
  85300, 89500, 93800, 98200, 102700, 107300, 112000, 116800, 121700, 126700,
  1000000,
];

export function calcLevelFromPts(userPoints = 0) {
  const pts = Number(userPoints) || 0;
  let currentLevel = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
    if (pts < LEVEL_THRESHOLDS[i + 1]) {
      currentLevel = i + 1;
      break;
    }
  }
  return currentLevel;
}

