const SCENE_IDS = ['discipline-gym', 'keep-going-track', 'one-more-barbell', 'step-by-step'];
export const LOADING_SCENES = SCENE_IDS.map(id => ({ id, src: `/Image/loading-sport-light-v2/${id}.webp` }));
export const DARK_LOADING_SCENES = SCENE_IDS.map(id => ({ id, src: `/Image/loading-sport-dark-v2/${id}.webp` }));

export function scenesForTheme(theme) {
  return theme === 'light' ? LOADING_SCENES : DARK_LOADING_SCENES;
}

export function pickLoadingScene(previousId, random = Math.random, theme = 'light') {
  const candidates = scenesForTheme(theme).filter(scene => scene.id !== previousId);
  return candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))];
}

const launchScenes = new Map();
export function getLaunchScene(theme = 'light') {
  if (launchScenes.has(theme)) return launchScenes.get(theme);
  const storageKey = `loading-scene-${theme}`;
  let previous;
  try { previous = window.sessionStorage.getItem(storageKey); } catch {}
  const scene = pickLoadingScene(previous, Math.random, theme);
  launchScenes.set(theme, scene);
  try { window.sessionStorage.setItem(storageKey, scene.id); } catch {}
  return scene;
}
