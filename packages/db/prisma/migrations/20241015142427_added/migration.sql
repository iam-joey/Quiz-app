/*
  Warnings:

  - Made the column `categoryId` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `SimulationTestDetail` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `UserTestDetail` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "SimulationTestDetail" DROP CONSTRAINT "SimulationTestDetail_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "UserTestDetail" DROP CONSTRAINT "UserTestDetail_categoryId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "categoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SimulationTestDetail" ALTER COLUMN "categoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserTestDetail" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestDetail" ADD CONSTRAINT "UserTestDetail_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationTestDetail" ADD CONSTRAINT "SimulationTestDetail_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
