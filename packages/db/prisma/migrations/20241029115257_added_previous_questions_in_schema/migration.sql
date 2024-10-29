-- CreateTable
CREATE TABLE "PreviousYearQuestions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PreviousYearQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PreviousYearQuestionsToQuestion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PreviousYearQuestions_id_key" ON "PreviousYearQuestions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PreviousYearQuestions_name_key" ON "PreviousYearQuestions"("name");

-- CreateIndex
CREATE INDEX "PreviousYearQuestions_id_idx" ON "PreviousYearQuestions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_PreviousYearQuestionsToQuestion_AB_unique" ON "_PreviousYearQuestionsToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_PreviousYearQuestionsToQuestion_B_index" ON "_PreviousYearQuestionsToQuestion"("B");

-- AddForeignKey
ALTER TABLE "_PreviousYearQuestionsToQuestion" ADD CONSTRAINT "_PreviousYearQuestionsToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "PreviousYearQuestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreviousYearQuestionsToQuestion" ADD CONSTRAINT "_PreviousYearQuestionsToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
