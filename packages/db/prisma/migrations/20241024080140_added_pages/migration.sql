/*
  Warnings:

  - You are about to drop the column `s3Key` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `completedPages` on the `UserDocumentProgress` table. All the data in the column will be lost.
  - You are about to drop the column `pages` on the `UserDocumentProgress` table. All the data in the column will be lost.
  - Added the required column `totalPages` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPage` to the `UserDocumentProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicId` to the `UserDocumentProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPages` to the `UserDocumentProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Document_id_idx";

-- DropIndex
DROP INDEX "Document_s3Key_idx";

-- DropIndex
DROP INDEX "Topic_documentId_idx";

-- DropIndex
DROP INDEX "Topic_documentId_key";

-- DropIndex
DROP INDEX "Topic_name_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "s3Key",
DROP COLUMN "uploadDate",
ADD COLUMN     "totalPages" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "documentId",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserDocumentProgress" DROP COLUMN "completedPages",
DROP COLUMN "pages",
ADD COLUMN     "currentPage" INTEGER NOT NULL,
ADD COLUMN     "topicId" TEXT NOT NULL,
ADD COLUMN     "totalPages" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "s3Key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Page_s3Key_idx" ON "Page"("s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "Page_documentId_pageNumber_key" ON "Page"("documentId", "pageNumber");

-- CreateIndex
CREATE INDEX "UserDocumentProgress_topicId_idx" ON "UserDocumentProgress"("topicId");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocumentProgress" ADD CONSTRAINT "UserDocumentProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
