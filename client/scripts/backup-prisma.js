// Covers both legacy and compact progress in one repeatable-read snapshot.
import('./progress-migration/backup.mjs').catch(error => { console.error(error); process.exitCode = 1; });
