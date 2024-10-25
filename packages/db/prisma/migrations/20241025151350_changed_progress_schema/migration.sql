/*
  Warnings:

  - You are about to drop the column `currentPage` on the `UserDocumentProgress` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `UserDocumentProgress` table. All the data in the column will be lost.
  - You are about to drop the column `totalPages` on the `UserDocumentProgress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,topicId]` on the table `UserDocumentProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserDocumentProgress" DROP CONSTRAINT "UserDocumentProgress_documentId_fkey";

-- DropIndex
DROP INDEX "UserDocumentProgress_documentId_idx";

-- DropIndex
DROP INDEX "UserDocumentProgress_userId_documentId_key";

-- AlterTable
ALTER TABLE "UserDocumentProgress" DROP COLUMN "currentPage",
DROP COLUMN "documentId",
DROP COLUMN "totalPages";

-- CreateTable
CREATE TABLE "UserDocumentDetail" (
    "id" TEXT NOT NULL,
    "userDocumentId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDocumentDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToUserDocumentProgress" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDocumentDetail_id_key" ON "UserDocumentDetail"("id");

-- CreateIndex
CREATE INDEX "UserDocumentDetail_userDocumentId_idx" ON "UserDocumentDetail"("userDocumentId");

-- CreateIndex
CREATE INDEX "UserDocumentDetail_documentId_idx" ON "UserDocumentDetail"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDocumentDetail_userDocumentId_documentId_key" ON "UserDocumentDetail"("userDocumentId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToUserDocumentProgress_AB_unique" ON "_DocumentToUserDocumentProgress"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToUserDocumentProgress_B_index" ON "_DocumentToUserDocumentProgress"("B");

-- CreateIndex
CREATE UNIQUE INDEX "UserDocumentProgress_userId_topicId_key" ON "UserDocumentProgress"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "UserDocumentDetail" ADD CONSTRAINT "UserDocumentDetail_userDocumentId_fkey" FOREIGN KEY ("userDocumentId") REFERENCES "UserDocumentProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocumentDetail" ADD CONSTRAINT "UserDocumentDetail_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToUserDocumentProgress" ADD CONSTRAINT "_DocumentToUserDocumentProgress_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToUserDocumentProgress" ADD CONSTRAINT "_DocumentToUserDocumentProgress_B_fkey" FOREIGN KEY ("B") REFERENCES "UserDocumentProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
