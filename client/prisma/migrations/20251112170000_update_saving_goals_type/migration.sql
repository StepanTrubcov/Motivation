-- AlterTable
ALTER TABLE "User" ALTER COLUMN "savingGoals" TYPE JSONB USING "savingGoals"::JSONB;