/*
  Warnings:

  - Added the required column `level` to the `GroupMembers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `SubUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroupMembers" ADD COLUMN     "level" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SubUser" ADD COLUMN     "level" INTEGER NOT NULL;
