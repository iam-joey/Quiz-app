/*
  Warnings:

  - You are about to drop the `PreviousYearQuestions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PreviousYearQuestionsToQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PreviousYearQuestionsToQuestion" DROP CONSTRAINT "_PreviousYearQuestionsToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_PreviousYearQuestionsToQuestion" DROP CONSTRAINT "_PreviousYearQuestionsToQuestion_B_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "prevTopic" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "PreviousYearQuestions";

-- DropTable
DROP TABLE "_PreviousYearQuestionsToQuestion";
