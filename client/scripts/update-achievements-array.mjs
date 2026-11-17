#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACHIEVEMENT_TEMPLATES, validateAchievementTemplates } from '../src/lib/achievementTemplates.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiPath = path.join(root, 'src/lib/api/Api.js');
const apiSource = fs.readFileSync(apiPath, 'utf8');
validateAchievementTemplates();
if (!apiSource.includes("import { ACHIEVEMENT_TEMPLATES } from '@/lib/achievementTemplates.mjs';")) {
  throw new Error('Api.js is not wired to the canonical achievement catalog');
}
console.log(`Verified canonical achievement catalog (${ACHIEVEMENT_TEMPLATES.length} entries). No source files were rewritten.`);
