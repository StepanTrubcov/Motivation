// Prompts for confirmation, saves a fresh safety copy and restores all tables atomically.
import('./progress-migration/restore.mjs').catch(error => { console.error(error); process.exitCode = 1; });
