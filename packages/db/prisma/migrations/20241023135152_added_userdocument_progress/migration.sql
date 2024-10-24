-- CreateTable
CREATE TABLE "UserDocumentProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "completedPages" INTEGER[],
    "pages" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserDocumentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDocumentProgress_id_key" ON "UserDocumentProgress"("id");

-- CreateIndex
CREATE INDEX "UserDocumentProgress_userId_idx" ON "UserDocumentProgress"("userId");

-- CreateIndex
CREATE INDEX "UserDocumentProgress_documentId_idx" ON "UserDocumentProgress"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDocumentProgress_userId_documentId_key" ON "UserDocumentProgress"("userId", "documentId");

-- AddForeignKey
ALTER TABLE "UserDocumentProgress" ADD CONSTRAINT "UserDocumentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocumentProgress" ADD CONSTRAINT "UserDocumentProgress_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
