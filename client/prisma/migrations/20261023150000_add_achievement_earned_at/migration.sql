ALTER TABLE "Achievement"
ADD COLUMN "earnedAt" TIMESTAMP(3);

UPDATE "Achievement"
SET "earnedAt" = "updatedAt"
WHERE "status" = 'my';
