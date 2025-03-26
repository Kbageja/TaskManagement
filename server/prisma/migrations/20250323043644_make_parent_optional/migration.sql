-- AlterTable
ALTER TABLE "GroupMembers" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "GroupMembers" ADD CONSTRAINT "GroupMembers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
