-- DropForeignKey
ALTER TABLE "SimulationTestDetail" DROP CONSTRAINT "SimulationTestDetail_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "UserTestDetail" DROP CONSTRAINT "UserTestDetail_categoryId_fkey";

-- AlterTable
ALTER TABLE "SimulationTestDetail" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserTestDetail" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserTestDetail" ADD CONSTRAINT "UserTestDetail_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationTestDetail" ADD CONSTRAINT "SimulationTestDetail_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
