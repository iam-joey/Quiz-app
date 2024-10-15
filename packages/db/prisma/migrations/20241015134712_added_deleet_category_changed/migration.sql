-- DropForeignKey
ALTER TABLE "UserTestDetail" DROP CONSTRAINT "UserTestDetail_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "UserTestDetail" ADD CONSTRAINT "UserTestDetail_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
