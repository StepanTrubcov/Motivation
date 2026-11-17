# Shared catalogs and compact personal progress

The application now stores catalog definitions in versioned code assets. PostgreSQL stores personal state, earned rewards, goal periods, daily exceptions and operation receipts. The API still returns the existing goal, achievement and calendar shapes.

## Stored data

- `UserGoal`: goals a user has taken, historical progress and custom goals. Standard goals refer to a definition/version; only custom goals contain their own title/category/points. Removing a goal retains earlier progress.
- `EarnedAchievement`: only earned achievements, with their stable ID, template ID and exact original dates. Locked cards are virtual catalog entries.
- `GoalPeriod`: one contiguous period with the same goal settings and display position. No daily copies of a goal are stored in advance.
- `GoalDayState`: sparse exceptions such as a completed day.
- `OperationReceipt`: request IDs that prevent duplicate completion, undo, create/take/remove requests. These are correctness data and must not be pruned as cache.
- `User.progressMeta`: catalog versions, references to immutable legacy definitions, old achievement ID mappings, compact calendar coverage and migration verification metadata. It also preserves inactive zero selections and goal order.

The original `Goal`, `Achievement` and `User.savingGoals` storage remains available only for explicit legacy rollback. All 30 migrated accounts have empty legacy tables/calendar arrays. SQL guards reject recreating those copies for `storageVersion = 1` accounts. New accounts default to compact storage.

## Catalog versions

`src/lib/progress/goalCatalogVersions.json` contains immutable goal catalogs and their translations/time choices. Never change a published `*-v1` definition to alter historical results. Add a new version and an explicit version transition instead; update the allowlist/defaults deliberately.

`src/lib/progress/legacyDefinitions.json` contains shared historical goal and achievement definitions, not user progress or dates. It is append-only. Rebuild/append definitions from a complete pre-migration backup with:

    node scripts/progress-migration/build-definitions.mjs scripts/backups/<legacy-backup.json>

The original 31-achievement collections and the new 27-achievement collections were preserved separately. `testBot` keeps its separate goal catalog. Existing earned IDs, dates, points and goal IDs were not replaced. Empty/missed calendar dates and future calendar coverage remain visible through the compatibility reader.

## Transactions and reads

Completion and lifecycle operations use serializable transactions and the same existing planners. They write personal state, sparse calendar changes, points and receipts together. The normalized store never writes expanded history back into `User.savingGoals`.

Read snapshots use repeatable-read transactions with a bounded retry for transient connection/pool failures. Calendar components are fetched in one SQL statement. A process reuses one Prisma pool, bounded by default to three connections. Explicit DSN pool settings are respected; `APP_DB_CONNECTION_LIMIT` can set the default without changing TLS or credentials.

## Migration procedure

1. Create a consistent full backup and its SHA-256 checksum: `npm run backup`.
2. Apply the two SQL migrations and regenerate Prisma Client. Restart the API process after generating a client with new fields.
3. Build/append legacy definitions from the pre-migration backup.
4. Run `node scripts/progress-migration/run.mjs --testbot`. This saves a private per-account snapshot and compares points, every existing goal, earned states/dates, the full calendar and streak/freeze before committing. A mismatch rolls back the account.
5. Verify the actual interface and API, then run `node scripts/progress-migration/run.mjs --all`.
6. Run `node scripts/progress-migration/verify.mjs scripts/backups/<pre-migration-full-backup.json>`. This additionally compares every achievement progress value.
7. Save another full backup containing both structures. Only then run `node scripts/progress-migration/run.mjs --all --cleanup`.
8. Run the verification again, and save the compact final backup.

Cleanup rechecks the source fingerprint and current logical data in a transaction. It refuses deletion if personal state has diverged from the old copies; investigate active user changes instead of forcing cleanup. Migration and cleanup are idempotent for completed accounts.

The applied migrations are:

- `20261102100000_compact_progress_store`
- `20261102110000_shared_catalog_defaults`

## Backup and recovery

`npm run backup` covers all eight tables in a single repeatable-read snapshot, writes a private JSON file plus a full SHA-256 checksum and does not prune older backups. `npm run list-backups` includes both old and new formats.

To restore deliberately, stop application writes and run:

    npm run restore -- progress-full-<timestamp>.json

The command validates the file/relations and checksum, asks for `confirm`, creates another safety backup and restores all tables in a single transaction. Old backup formats restore as legacy accounts. Compact flags are enabled after legacy copies are inserted, respecting the write guards. A failed restore rolls back rather than leaving a partly restored database. No full restore was performed on live accounts during this migration.

## Checks

    node --test src/lib/*.test.mjs
    node scripts/progress-migration/test-db.mjs
    node scripts/check-live-api.mjs --production --port=3002 --burst
    npm run lint
    npm run build

The PostgreSQL test uses temporary accounts inside an outer transaction and always rolls it back. It covers migration parity, earned dates, completion/undo/replay, custom goals, retaking, guarded cleanup, new accounts and initial rewards. The API burst check makes read-only concurrent startup requests. These are focused correctness checks, not a mass-user load benchmark.
