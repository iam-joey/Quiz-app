import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { s3 } from "@/src/lib/utils";
import { PDFDocument } from "pdf-lib";

//api/docupload this is the api endpoint that is called when a user uploads a document to a topic. The document is stored in an S3 bucket and the topic is updated with the document's filename and page count.

// Function to count pages in a PDF
async function getPageCountFromPdf(pdfBuffer: Buffer): Promise<number> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  return pdfDoc.getPageCount();
}

async function uploadDocumentToS3(
  s3Key: string,
  content: Buffer,
  contentType: string
) {
  const s3Params = {
    Bucket: "quiz-app-doctor",
    Key: s3Key,
    Body: content,
    ContentType: contentType,
  };
  try {
    await s3.send(new PutObjectCommand(s3Params));
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload document to storage");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { topicId, file } = await request.json();

    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existingTopic) {
      return NextResponse.json({
        error: true,
        message: "Topic does not exist. Please provide a valid topicId.",
      });
    }

    let buffer;
    try {
      buffer = Buffer.from(file, "base64");
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid file content" },
        { status: 400 }
      );
    }

    // Validate that the buffer contains a PDF
    const fileType = "application/pdf";
    if (!buffer.toString("utf8", 0, 4).includes("%PDF")) {
      return NextResponse.json({
        error: true,
        message: "Uploaded file is not a valid PDF.",
      });
    }

    let pageCount;
    try {
      pageCount = await getPageCountFromPdf(buffer);
    } catch (error) {
      console.error("Error extracting page count from PDF:", error);
      return NextResponse.json({
        error: true,
        message: "Failed to extract page count from PDF",
      });
    }

    const s3Key = `${topicId}-document.pdf`;

    await prisma.topic.update({
      where: { id: topicId },
      data: {
        docfileName: s3Key,
        pages: pageCount,
      },
    });

    await uploadDocumentToS3(s3Key, buffer, fileType);

    return NextResponse.json({
      error: false,
      message: "PDF uploaded successfully",
    });
  } catch (error) {
    console.error("Error handling document upload:", error);
    return NextResponse.json({
      error: true,
      message: "An error occurred while processing the document",
    });
  }
}
