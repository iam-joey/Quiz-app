import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { s3 } from "@/src/lib/utils";
import * as unzipper from "unzipper";
import { XMLParser } from "fast-xml-parser";
import { convert } from "libreoffice-convert";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs/promises";

// Function to sanitize file names
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

async function convertDocxToPdf(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    convert(buffer, ".pdf", undefined, (err, result) => {
      if (err) {
        reject(new Error("Conversion to PDF failed"));
      }
      resolve(result);
    });
  });
}

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

    let pdfBuffer;
    try {
      pdfBuffer = await convertDocxToPdf(buffer);
    } catch (error) {
      console.error("Error converting DOCX to PDF:", error);
      return NextResponse.json({
        error: true,
        message: "Failed to convert DOCX to PDF",
      });
    }

    let pageCount;
    try {
      pageCount = await getPageCountFromPdf(pdfBuffer);
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
    const fileType = "application/pdf";
    await uploadDocumentToS3(s3Key, pdfBuffer, fileType);

    return NextResponse.json({
      error: false,
      message: "Document uploaded and converted to PDF successfully",
    });
  } catch (error) {
    console.error("Error handling document upload:", error);
    return NextResponse.json({
      error: true,
      message: "An error occurred while processing the document",
    });
  }
}
