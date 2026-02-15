/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id]` on the table `victory_types_catalog` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "victory_types_catalog_name_key";

-- AlterTable
ALTER TABLE "victory_types_catalog" ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "victory_types_catalog_name_user_id_key" ON "victory_types_catalog"("name", "user_id");

-- AddForeignKey
ALTER TABLE "victory_types_catalog" ADD CONSTRAINT "victory_types_catalog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
