/*
  Warnings:

  - Added the required column `groupId` to the `SubUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubUser" ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SubUser" ADD CONSTRAINT "SubUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
