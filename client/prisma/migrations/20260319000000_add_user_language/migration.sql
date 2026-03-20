-- AlterTable
-- Adding user interface language without touching existing user data.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserLanguage') THEN
    CREATE TYPE "UserLanguage" AS ENUM ('rus', 'ang');
  END IF;
END$$;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "language" "UserLanguage" NOT NULL DEFAULT 'rus';

