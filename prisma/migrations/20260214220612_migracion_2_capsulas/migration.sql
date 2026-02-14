/*
  Warnings:

  - You are about to drop the column `target_emotion_id` on the `capsules` table. All the data in the column will be lost.
  - You are about to drop the column `initial_emotion_id` on the `crisis_sessions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "capsules" DROP CONSTRAINT "capsules_target_emotion_id_fkey";

-- DropForeignKey
ALTER TABLE "crisis_sessions" DROP CONSTRAINT "crisis_sessions_initial_emotion_id_fkey";

-- AlterTable
ALTER TABLE "capsules" DROP COLUMN "target_emotion_id";

-- AlterTable
ALTER TABLE "crisis_sessions" DROP COLUMN "initial_emotion_id",
ADD COLUMN     "companion" VARCHAR(100),
ADD COLUMN     "intensity_level" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "is_reflection_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" VARCHAR(100),
ADD COLUMN     "substance_use" VARCHAR(50),
ADD COLUMN     "trigger_description" TEXT;

-- CreateTable
CREATE TABLE "_CapsuleEmotions" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CrisisEmotions" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CapsuleEmotions_AB_unique" ON "_CapsuleEmotions"("A", "B");

-- CreateIndex
CREATE INDEX "_CapsuleEmotions_B_index" ON "_CapsuleEmotions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CrisisEmotions_AB_unique" ON "_CrisisEmotions"("A", "B");

-- CreateIndex
CREATE INDEX "_CrisisEmotions_B_index" ON "_CrisisEmotions"("B");

-- AddForeignKey
ALTER TABLE "_CapsuleEmotions" ADD CONSTRAINT "_CapsuleEmotions_A_fkey" FOREIGN KEY ("A") REFERENCES "capsules"("capsule_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapsuleEmotions" ADD CONSTRAINT "_CapsuleEmotions_B_fkey" FOREIGN KEY ("B") REFERENCES "emotions_catalog"("emotion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrisisEmotions" ADD CONSTRAINT "_CrisisEmotions_A_fkey" FOREIGN KEY ("A") REFERENCES "crisis_sessions"("crisis_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrisisEmotions" ADD CONSTRAINT "_CrisisEmotions_B_fkey" FOREIGN KEY ("B") REFERENCES "emotions_catalog"("emotion_id") ON DELETE CASCADE ON UPDATE CASCADE;
