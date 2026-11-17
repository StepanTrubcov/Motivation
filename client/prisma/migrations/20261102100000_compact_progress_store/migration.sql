-- AlterTable
ALTER TABLE "User" ADD COLUMN     "progressMeta" JSONB,
ADD COLUMN     "storageVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "definitionKey" TEXT,
    "custom" JSONB,
    "status" "GoalStatus" NOT NULL DEFAULT 'not_started',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "selectedOption" INTEGER,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarnedAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EarnedAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalPeriod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "startDay" TEXT NOT NULL,
    "endDay" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "baseStatus" TEXT NOT NULL,

    CONSTRAINT "GoalPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalDayState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "GoalDayState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationReceipt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "OperationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserGoal_userId_idx" ON "UserGoal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EarnedAchievement_userId_templateId_key" ON "EarnedAchievement"("userId", "templateId");

-- CreateIndex
CREATE INDEX "GoalPeriod_userId_goalId_startDay_endDay_idx" ON "GoalPeriod"("userId", "goalId", "startDay", "endDay");

-- CreateIndex
CREATE INDEX "GoalDayState_userId_date_idx" ON "GoalDayState"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "GoalDayState_periodId_date_key" ON "GoalDayState"("periodId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "OperationReceipt_userId_kind_requestId_key" ON "OperationReceipt"("userId", "kind", "requestId");

-- AddForeignKey
ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedAchievement" ADD CONSTRAINT "EarnedAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalPeriod" ADD CONSTRAINT "GoalPeriod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalDayState" ADD CONSTRAINT "GoalDayState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalDayState" ADD CONSTRAINT "GoalDayState_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "GoalPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationReceipt" ADD CONSTRAINT "OperationReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
