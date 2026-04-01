-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "templateId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Achievement_userId_templateId_idx" ON "Achievement"("userId", "templateId");
