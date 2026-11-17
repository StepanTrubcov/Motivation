-- New accounts use shared catalogs immediately; legacy mode remains available for explicit rollback.
ALTER TABLE "User" ALTER COLUMN "storageVersion" SET DEFAULT 1;
ALTER TABLE "User" ALTER COLUMN "progressMeta" SET DEFAULT '{"goalCatalog":"standard-v1","achievementCatalog":"v2","achievementsInitialized":false,"calendar":{"ranges":[],"extras":{}}}'::jsonb;

-- Stale clients or maintenance scripts must not silently recreate full catalog copies.
CREATE FUNCTION "reject_legacy_catalog_write"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM "User" WHERE "id" = NEW."userId" AND "storageVersion" = 1) THEN
    RAISE EXCEPTION 'Account uses compact progress storage; write personal state instead of legacy catalog copies' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "Goal_compact_write_guard" BEFORE INSERT OR UPDATE ON "Goal" FOR EACH ROW EXECUTE FUNCTION "reject_legacy_catalog_write"();
CREATE TRIGGER "Achievement_compact_write_guard" BEFORE INSERT OR UPDATE ON "Achievement" FOR EACH ROW EXECUTE FUNCTION "reject_legacy_catalog_write"();

CREATE FUNCTION "reject_legacy_calendar_write"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."storageVersion" = 1 AND NEW."storageVersion" = 1
     AND NEW."savingGoals" IS DISTINCT FROM OLD."savingGoals" AND cardinality(NEW."savingGoals") > 0 THEN
    RAISE EXCEPTION 'Account uses compact calendar storage; write periods and daily states instead' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "User_compact_calendar_guard" BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION "reject_legacy_calendar_write"();
