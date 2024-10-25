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
    params: { progressId: string };
  }
) {
  try {
    const progressId = params.progressId;
    if (!progressId) {
      return NextResponse.json(
        { error: true, message: "Missing topicId parameter" },
        { status: 400 }
      );
    }
    const userLearningHistory = await prisma.userLearningHistory.findUnique({
      where: {
        id: progressId,
      },
      select: {
        id: true,
        userTopics: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
                docfileName: true,
              },
            },
            currentPage: true,
          },
        },
      },
    });
    if (!userLearningHistory) {
      return NextResponse.json(
        { error: true, msg: "User learning history not found" },
        { status: 404 }
      );
    }
    const pdfs = await Promise.all(
      userLearningHistory.userTopics.map(async (userTopic) => {
        const docfileName = userTopic.topic.docfileName;
        if (docfileName) {
          try {
            const pdfBuffer = await getDocumentFromS3(docfileName);
            return {
              topicId: userTopic.topic.id,
              pdf: pdfBuffer.toString("base64"),
            };
          } catch (error) {
            console.error(
              `Failed to retrieve PDF for topic ${userTopic.topic.id}:`,
              error
            );
            return { topicId: userTopic.topic.id, pdf: null };
          }
        }
        return { topicId: userTopic.topic.id, pdf: null };
      })
    );
    return NextResponse.json({
      error: true,
      message: "User document progress already exists",
      data: {
        ...userLearningHistory,
        pdfs,
      },
    });
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
