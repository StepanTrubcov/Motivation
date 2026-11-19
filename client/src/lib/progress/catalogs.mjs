import { createHash } from 'node:crypto';
import definitions from './legacyDefinitions.json' with { type: 'json' };
import curated from '../testbot-goal-catalog.json' with { type: 'json' };
import frozenCatalogs from './goalCatalogVersions.json' with { type: 'json' };
import { ACHIEVEMENT_TEMPLATES } from '../achievementTemplates.mjs';
export const TEST_USER_ID = curated.userId;
export const hashValue = value => createHash('sha256').update(JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a],[b]) => a.localeCompare(b))) : item)).digest('hex').slice(0, 24);
export const goalDefinition = goal => Object.fromEntries(['title','points','category','description'].map(k => [k, goal[k] ?? null]));
export const achievementDefinition = row => Object.fromEntries(['templateId','title','description','requirement','image','gif','rarity','type','goalIds','target'].map(k => [k, row[k] ?? null]));
export function goalTemplateId(goal) {
  const prefix = `${goal.userId}_`;
  return goal.id.startsWith(prefix) && /^\d+$/.test(goal.id.slice(prefix.length)) ? goal.id.slice(prefix.length) : null;
}
export function goalCatalog(user) {
  const key = user.progressMeta?.goalCatalog || (user.id === TEST_USER_ID ? 'testbot-v1' : 'standard-v1');
  if (!['testbot-v1','standard-v1'].includes(key)) throw new Error(`Unknown goal catalog ${key}`);
  return frozenCatalogs[key];
}
export function resolveGoalDefinition(key) {
  const value = definitions.goals[key];
  if (!value) throw new Error(`Missing immutable goal definition ${key}`);
  return value;
}
export function achievementCatalog() {
  // Compact accounts always use the canonical catalog shipped with the app.
  // Legacy achievement snapshots are never revived from per-user metadata.
  return ACHIEVEMENT_TEMPLATES.map(a => ({ ...a, templateId: `v2:${a.id}` }));
}
export function legacyCatalogKey(rows) {
  const keys = rows.map(row => hashValue(achievementDefinition(row))).sort();
  const key = hashValue(keys);
  if (!definitions.catalogs[key]) throw new Error('Achievement definitions changed after the backup; create a new snapshot before migrating');
  return key;
}
export function migratedGoalDefinitionKey(goal) {
  const key = hashValue(goalDefinition(goal));
  resolveGoalDefinition(key);
  return key;
}
export function virtualAchievementId(user, templateId) {
  return user.progressMeta?.achievementIds?.[templateId] || `${user.id}~${templateId}`;
}
