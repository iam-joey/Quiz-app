-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "documentId" INTEGER,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "s3Key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_documentId_key" ON "Topic"("documentId");

-- CreateIndex
CREATE INDEX "Topic_name_idx" ON "Topic"("name");

-- CreateIndex
CREATE INDEX "Topic_documentId_idx" ON "Topic"("documentId");

-- CreateIndex
CREATE INDEX "Document_id_idx" ON "Document"("id");

-- CreateIndex
CREATE INDEX "Document_s3Key_idx" ON "Document"("s3Key");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
