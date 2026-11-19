import test from 'node:test';
import assert from 'node:assert/strict';
import legacy from './progress/legacyDefinitions.json' with { type: 'json' };
import { ACHIEVEMENT_TEMPLATES } from './achievementTemplates.mjs';
import { achievementImageSrc, decorateAchievementArtwork, resolveAchievementImage } from './achievementImages.js';

test('legacy achievement IDs resolve to current catalog artwork without changing award data', () => {
  const oldBook = {
    id: 'old-book', templateId: '3', title: 'Книжный марафон', type: 'goal_based',
    goalIds: ['2'], target: 30, rarity: 'common', status: 'my', earnedAt: '2026-01-02T00:00:00.000Z',
    image: '/Image/achievements/achievement-3.webp', gif: 'https://old.example/book.gif',
  };
  const updated = decorateAchievementArtwork(oldBook);

  assert.equal(updated.image, ACHIEVEMENT_TEMPLATES.find(item => item.id === '4').image);
  assert.equal(updated.gif, '');
  assert.equal(updated.status, oldBook.status);
  assert.equal(updated.earnedAt, oldBook.earnedAt);
  assert.equal(updated.title, oldBook.title);
});

test('every achievement in stored legacy catalogs uses current artwork and drops retired GIFs', () => {
  const currentImages = new Set(ACHIEVEMENT_TEMPLATES.map(item => item.image));
  const catalogKeys = [...new Set(Object.values(legacy.catalogs).flat())];

  for (const key of catalogKeys) {
    const definition = legacy.achievements[key];
    if (!definition) continue;
    const result = decorateAchievementArtwork({
      ...definition,
      templateId: definition.templateId || `legacy:${key}`,
    });
    assert.ok(currentImages.has(result.image), `${definition.title} retained legacy art: ${result.image}`);
    assert.equal(result.gif, '', `${definition.title} retained a retired animation`);
  }
});

test('current template IDs use canonical art and image URLs invalidate Telegram cache', () => {
  const current = ACHIEVEMENT_TEMPLATES.find(item => item.id === '10');
  assert.equal(resolveAchievementImage('/old/image.webp', { ...current, templateId: 'v2:10' }), current.image);
  assert.equal(achievementImageSrc(current.image), `${current.image}?v=20261119`);
});
