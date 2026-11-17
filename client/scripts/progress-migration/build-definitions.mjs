import fs from 'node:fs';
import { createHash } from 'node:crypto';
const file = process.argv[2];
if (!file) throw new Error('Backup path is required');
const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = value => createHash('sha256').update(JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a],[b]) => a.localeCompare(b))) : item)).digest('hex').slice(0, 24);
const definitions = { goals: {}, achievements: {}, catalogs: {} };
for (const goal of backup.goals) {
  if (!goal.id.startsWith(`${goal.userId}_`) || !/^\d+$/.test(goal.id.slice(goal.userId.length + 1))) continue;
  const data = Object.fromEntries(['title','points','category','description'].map(k => [k, goal[k] ?? null]));
  definitions.goals[hash(data)] = data;
}
const users = new Map();
for (const row of backup.achievements) {
  const data = Object.fromEntries(['templateId','title','description','requirement','image','gif','rarity','type','goalIds','target'].map(k => [k, row[k] ?? null]));
  const key = hash(data);
  definitions.achievements[key] = data;
  if (!users.has(row.userId)) users.set(row.userId, []);
  users.get(row.userId).push(key);
}
for (const keys of users.values()) {
  keys.sort();
  definitions.catalogs[hash(keys)] = keys;
}
const target = 'src/lib/progress/legacyDefinitions.json';
fs.mkdirSync('src/lib/progress', { recursive: true });
const existing = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target,'utf8')) : {};
for (const section of ['goals','achievements','catalogs']) definitions[section] = { ...(existing[section] || {}), ...definitions[section] };
fs.writeFileSync(target, JSON.stringify(definitions, null, 2) + '\n');
console.log(JSON.stringify({ goalDefinitions: Object.keys(definitions.goals).length, achievementDefinitions: Object.keys(definitions.achievements).length, achievementCatalogs: Object.keys(definitions.catalogs).length }));
