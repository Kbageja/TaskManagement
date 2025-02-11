/*
  Warnings:

  - You are about to drop the column `userId` on the `Group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[parentId,userId,groupId]` on the table `SubUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `GroupMembers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `SubUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_userId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "userId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GroupMembers" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "SubUser" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SubUser_parentId_userId_groupId_key" ON "SubUser"("parentId", "userId", "groupId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
