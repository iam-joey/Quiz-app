/*
  Warnings:

  - The primary key for the `Document` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Topic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[topicId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `topicId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_documentId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP CONSTRAINT "Document_pkey",
ADD COLUMN     "topicId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Document_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Document_id_seq";

-- AlterTable
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "documentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Topic_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Topic_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Document_topicId_key" ON "Document"("topicId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
