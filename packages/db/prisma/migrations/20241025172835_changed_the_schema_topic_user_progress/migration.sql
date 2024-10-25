/*
  Warnings:

  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserDocumentDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserDocumentProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DocumentToUserDocumentProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_topicId_fkey";

-- DropForeignKey
ALTER TABLE "UserDocumentDetail" DROP CONSTRAINT "UserDocumentDetail_documentId_fkey";

-- DropForeignKey
ALTER TABLE "UserDocumentDetail" DROP CONSTRAINT "UserDocumentDetail_userDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "UserDocumentProgress" DROP CONSTRAINT "UserDocumentProgress_topicId_fkey";

-- DropForeignKey
ALTER TABLE "UserDocumentProgress" DROP CONSTRAINT "UserDocumentProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "_DocumentToUserDocumentProgress" DROP CONSTRAINT "_DocumentToUserDocumentProgress_A_fkey";

-- DropForeignKey
ALTER TABLE "_DocumentToUserDocumentProgress" DROP CONSTRAINT "_DocumentToUserDocumentProgress_B_fkey";

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "docfileName" TEXT,
ADD COLUMN     "pages" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "UserDocumentDetail";

-- DropTable
DROP TABLE "UserDocumentProgress";

-- DropTable
DROP TABLE "_DocumentToUserDocumentProgress";

-- CreateTable
CREATE TABLE "UserLearningHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLearningHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLearningTopicIdsDetails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLearningTopicIdsDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserLearningHistoryToUserLearningTopicIdsDetails" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "UserLearningHistory_id_idx" ON "UserLearningHistory"("id");

-- CreateIndex
CREATE INDEX "UserLearningTopicIdsDetails_id_idx" ON "UserLearningTopicIdsDetails"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_UserLearningHistoryToUserLearningTopicIdsDetails_AB_unique" ON "_UserLearningHistoryToUserLearningTopicIdsDetails"("A", "B");

-- CreateIndex
CREATE INDEX "_UserLearningHistoryToUserLearningTopicIdsDetails_B_index" ON "_UserLearningHistoryToUserLearningTopicIdsDetails"("B");

-- AddForeignKey
ALTER TABLE "_UserLearningHistoryToUserLearningTopicIdsDetails" ADD CONSTRAINT "_UserLearningHistoryToUserLearningTopicIdsDetails_A_fkey" FOREIGN KEY ("A") REFERENCES "UserLearningHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserLearningHistoryToUserLearningTopicIdsDetails" ADD CONSTRAINT "_UserLearningHistoryToUserLearningTopicIdsDetails_B_fkey" FOREIGN KEY ("B") REFERENCES "UserLearningTopicIdsDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
