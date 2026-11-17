import test from 'node:test';
import assert from 'node:assert/strict';
import { LOADING_SCENES, pickLoadingScene, getLaunchScene } from './loadingScenes.mjs';

test('each scene can be selected and immediate repeats are excluded', () => {
  for (const previous of LOADING_SCENES) {
    const selected = new Set(Array.from({ length: LOADING_SCENES.length - 1 }, (_, i) => pickLoadingScene(previous.id, () => (i + .5) / (LOADING_SCENES.length - 1)).id));
    assert.equal(selected.size, LOADING_SCENES.length - 1);
    assert.ok(!selected.has(previous.id));
  }
});
test('new sessions and unknown stored IDs can use the entire collection', () => {
  const selected = new Set(Array.from({ length: LOADING_SCENES.length }, (_, i) => pickLoadingScene('unknown', () => (i + .5) / LOADING_SCENES.length).id));
  assert.equal(selected.size, LOADING_SCENES.length);
});
test('one scene remains stable through all loading phases, even with blocked storage', () => {
  const first = getLaunchScene();
  assert.equal(getLaunchScene(), first);
  assert.ok(LOADING_SCENES.includes(first));
});

test('dark collection is separate and does not repeat the previous scene', async () => {
  const { DARK_LOADING_SCENES, scenesForTheme } = await import('./loadingScenes.mjs');
  assert.equal(DARK_LOADING_SCENES.length, LOADING_SCENES.length);
  assert.equal(scenesForTheme('dark'), DARK_LOADING_SCENES);
  for (const previous of DARK_LOADING_SCENES) {
    const selected = new Set(Array.from({ length: DARK_LOADING_SCENES.length - 1 }, (_, i) => pickLoadingScene(previous.id, () => (i + .5) / (DARK_LOADING_SCENES.length - 1), 'dark').id));
    assert.equal(selected.size, LOADING_SCENES.length - 1);
    assert.ok(!selected.has(previous.id));
  }
  const dark = getLaunchScene('dark');
  assert.equal(getLaunchScene('dark'), dark);
  assert.ok(DARK_LOADING_SCENES.includes(dark));
  assert.ok(LOADING_SCENES.includes(getLaunchScene('light')));
});
