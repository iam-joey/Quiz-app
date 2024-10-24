import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { Readable } from "stream";
import { s3 } from "@/src/lib/utils";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function getDocumentFromS3(s3Key: string): Promise<Buffer> {
  const s3Params = {
    Bucket: "quiz-app-doctor",
    Key: s3Key,
  };

  try {
    const command = new GetObjectCommand(s3Params);
    const response = await s3.send(command);

    // Convert the readable stream (Node.js stream) to a Buffer
    if (response.Body instanceof Readable) {
      return streamToBuffer(response.Body);
    } else {
      throw new Error("Unexpected stream type");
    }
  } catch (error) {
    console.error("Error retrieving document from S3:", error);
    throw new Error("Failed to retrieve document from storage");
  }
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { userId: string; topicId: string };
  }
) {
  try {
    const topicId = params.topicId;
    const userId = params.userId;

    if (!topicId || !userId) {
      return NextResponse.json(
        { error: true, message: "Missing topicId or userId parameter" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { topicId },
    });

    if (!document) {
      return NextResponse.json(
        { error: true, message: "No document found for the given topicId" },
        { status: 404 }
      );
    }

    const userProgress = await prisma.userDocumentProgress.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId: document.id,
        },
      },
    });

    let progress = {
      currentPage: 0,
      totalPages: document.totalPages,
    };

    if (userProgress) {
      progress = {
        currentPage: userProgress.currentPage,
        totalPages: userProgress.totalPages,
      };
    }

    const s3Key = `${topicId}-document.pdf`;

    let pdfBuffer;
    try {
      pdfBuffer = await getDocumentFromS3(s3Key);
    } catch (error) {
      return NextResponse.json({
        error: true,
        message: "Failed to retrieve document",
      });
    }

    return new NextResponse(
      JSON.stringify({
        progress,
        pdf: pdfBuffer.toString("base64"),
        fileName: document.fileName,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error retrieving document:", error);
    return NextResponse.json(
      {
        error: true,
        message: "An error occurred while retrieving the document",
      },
      { status: 500 }
    );
  }
}
