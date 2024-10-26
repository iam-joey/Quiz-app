import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
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

// POST /api/createuserlearning/[userId]
// Request body: { topics: string[] } (topic ids array)

type UserTopic = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  currentPage: number;
  topicId: string;
};

type FindId = {
  id: string;
  userTopics: UserTopic[];
};

function findExactMatchingUserIds(
  findIds: FindId[],
  topicIds: string[]
): string[] {
  return findIds
    .filter((user) => {
      const userTopicIds = user.userTopics.map((topic) => topic.topicId);
      // Check if userTopicIds has exactly the same topics as topicIds
      return (
        userTopicIds.length === topicIds.length &&
        topicIds.every((id) => userTopicIds.includes(id))
      );
    })
    .map((user) => user.id);
}

export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { userId: string };
  }
) => {
  try {
    const userId = params.userId;

    const {
      topics, //send topic ids array
    }: {
      topics: string[];
    } = await req.json();
    console.log("topics", topics.length);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: true,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!topics || topics.length === 0) {
      return NextResponse.json(
        {
          error: true,
          message: "Topics are required",
        },
        { status: 400 }
      );
    }

    const findIds = await prisma.userLearningHistory.findMany({
      where: {
        userId: userId,
      },
      select: {
        userTopics: true,
        id: true,
      },
    });
    const matchingUserIds = findExactMatchingUserIds(findIds, topics);

    if (matchingUserIds.length > 0) {
      console.log("came inside", matchingUserIds);

      const alreadyPresent = await prisma.userLearningHistory.findUnique({
        where: {
          id: matchingUserIds[0],
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
                  pages: true,
                },
              },
              currentPage: true,
            },
          },
        },
      });

      const pdfs = await Promise.all(
        alreadyPresent!.userTopics.map(async (userTopic) => {
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
        error: false,
        message: "User document progress already exists",
        data: {
          ...alreadyPresent,
          new: false,
          pdfs,
        },
      });
    }

    const data = await prisma.userLearningHistory.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        userTopics: {
          create: topics.map((topic) => ({
            userId: userId,
            topic: {
              connect: {
                id: topic,
              },
            },
          })),
        },
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

    const pdfs = await Promise.all(
      data.userTopics.map(async (userTopic) => {
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
      error: false,
      message: "User document progress created successfully",
      data: {
        ...data,
        new: true,
        pdfs,
      },
    });
  } catch (error) {
    console.error("Error creating user document progress:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: true,
        message: "An error occurred while creating user document progress",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
