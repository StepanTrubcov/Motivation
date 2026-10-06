// Dry-run by default. Apply only after this version's assets are deployed.
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/lib/achievement-images.json'), 'utf8'));
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const value = (flag) => args.includes(flag) ? args[args.indexOf(flag) + 1] : null;
const backup = value('--backup');
const baseUrl = value('--base-url');
const rollbackFile = value('--rollback');
const byOld = new Map(manifest.map(entry => [entry.legacyImage, entry]));
const localPaths = new Set(manifest.map(entry => entry.image));
const prisma = new PrismaClient();
const hash = buffer => createHash('sha256').update(buffer).digest('hex');

async function verifyDeployment() {
  if (!baseUrl) throw new Error('--apply requires --base-url pointing to the deployed app');
  const base = new URL(baseUrl);
  if (base.protocol !== 'https:') throw new Error('Deployment URL must use HTTPS');
  for (const entry of manifest) {
    const response = await fetch(new URL(entry.image, base), { signal: AbortSignal.timeout(20000), redirect: 'error' });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
      throw new Error(`Deployed asset unavailable: ${entry.image} (${response.status})`);
    }
    const remote = Buffer.from(await response.arrayBuffer());
    const local = fs.readFileSync(path.join(root, 'public', entry.image.slice(1)));
    if (hash(remote) !== hash(local)) throw new Error(`Deployed asset differs: ${entry.image}`);
  }
  console.log('All 31 deployed images match the local files.');
}

function createBackup() {
  const dir = path.join(root, 'scripts/backups');
  const before = new Set(fs.readdirSync(dir));
  execFileSync('npm', ['run', 'backup'], { cwd: root, stdio: 'inherit' });
  const created = fs.readdirSync(dir).filter(name => !before.has(name) && /^prisma-backup-.*\.json$/.test(name));
  if (created.length !== 1) throw new Error('Could not verify a new database backup');
  const filename = path.join(dir, created[0]);
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (!['users', 'goals', 'achievements'].every(key => Array.isArray(data[key]))) {
    throw new Error('Backup is missing database tables');
  }
  fs.chmodSync(filename, 0o600);
  console.log('Verified fresh database backup:', filename);
  return filename;
}

async function rollback() {
  if (apply || backup) throw new Error('--rollback cannot be combined with --apply or --backup');
  const journal = JSON.parse(fs.readFileSync(path.resolve(rollbackFile), 'utf8'));
  if (journal.state !== 'applied' || !Array.isArray(journal.changes)) throw new Error('Expected an applied migration journal');
  for (const change of journal.changes) {
    if (byOld.get(change.oldImage)?.image !== change.newImage) throw new Error('Invalid rollback mapping');
  }
  createBackup();
  await prisma.$transaction(async tx => {
    for (const change of journal.changes) {
      const count = await tx.$executeRaw`UPDATE "Achievement" SET "image" = ${change.oldImage} WHERE "id" = ${change.id} AND "image" = ${change.newImage}`;
      if (count !== 1) throw new Error('Rollback image conflict; transaction rolled back');
    }
  }, { timeout: 120000 });
  journal.state = 'rolled-back';
  fs.writeFileSync(path.resolve(rollbackFile), JSON.stringify(journal, null, 2), { mode: 0o600 });
  console.log('Rollback complete: only image values restored.');
}

async function main() {
  if (rollbackFile) return rollback();
  for (const entry of manifest) {
    if (!fs.existsSync(path.join(root, 'public', entry.image.slice(1)))) throw new Error(`Missing local file: ${entry.image}`);
  }
  if (apply && backup) throw new Error('--backup is for offline dry-run only');
  if (apply) await verifyDeployment();
  const freshBackup = apply ? createBackup() : null;
  const rows = backup
    ? JSON.parse(fs.readFileSync(path.resolve(backup), 'utf8')).achievements
    : await prisma.achievement.findMany({ orderBy: { id: 'asc' } });
  if (!Array.isArray(rows)) throw new Error('No achievement records found');
  const changes = rows.filter(row => byOld.has(row.image)).map(row => ({
    id: row.id, oldImage: row.image, newImage: byOld.get(row.image).image,
  }));
  const unknown = rows.filter(row => !byOld.has(row.image) && !localPaths.has(row.image));
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', total: rows.length, toUpdate: changes.length,
    alreadyLocal: rows.filter(row => localPaths.has(row.image)).length, unmatched: unknown.length,
    unmatchedImages: [...new Set(unknown.map(row => row.image))],
  }, null, 2));
  if (!apply || changes.length === 0) return;
  if (unknown.length) throw new Error('Unmatched images require review before applying migration');
  const journalDir = path.join(root, 'scripts/achievement-image-migrations');
  fs.mkdirSync(journalDir, { recursive: true });
  const journalFile = path.join(journalDir, `images-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  const journal = { backup: freshBackup, state: 'prepared', changes };
  fs.writeFileSync(journalFile, JSON.stringify(journal, null, 2), { mode: 0o600 });
  await prisma.$transaction(async tx => {
    for (const entry of manifest) {
      const expected = changes.filter(change => change.oldImage === entry.legacyImage).length;
      if (!expected) continue;
      // Raw SQL intentionally changes ONLY image, including preserving updatedAt.
      const count = await tx.$executeRaw`UPDATE "Achievement" SET "image" = ${entry.image} WHERE "image" = ${entry.legacyImage}`;
      if (count !== expected) throw new Error('Concurrent image change detected; transaction rolled back');
    }
    const after = await tx.achievement.findMany({ orderBy: { id: 'asc' } });
    const afterById = new Map(after.map(row => [row.id, row]));
    if (after.length !== rows.length) throw new Error('Achievement count changed; transaction rolled back');
    for (const row of rows) {
      const expected = { ...row, image: byOld.get(row.image)?.image || row.image };
      if (JSON.stringify(afterById.get(row.id)) !== JSON.stringify(expected)) {
        throw new Error(`Unexpected record change ${row.id}; transaction rolled back`);
      }
    }
  }, { timeout: 120000 });
  journal.state = 'applied';
  fs.writeFileSync(journalFile, JSON.stringify(journal, null, 2), { mode: 0o600 });
  console.log('Migration verified. Only image changed. Rollback journal:', journalFile);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
