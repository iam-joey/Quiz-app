import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

// This is the endpoint for updating the current page of the user
// progressId is the id of the userLearningHistory
// topicId is the id of the topic
// userId is the id of the user

export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { userId: string; progressId: string; topicId: string };
  }
) => {
  try {
    const {
      page,
    }: {
      page: number;
    } = await req.json();

    const findUser = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
    });

    if (!findUser) {
      return NextResponse.json(
        {
          error: true,
          msg: "User not found",
        },
        { status: 404 }
      );
    }

    const findTopic = await prisma.topic.findUnique({
      where: {
        id: params.topicId,
      },
    });

    if (!findTopic) {
      return NextResponse.json(
        {
          error: true,
          msg: "Topic not found",
        },
        { status: 404 }
      );
    }

    const findLearningHistory = await prisma.userLearningHistory.findUnique({
      where: {
        id: params.progressId,
        userId: params.userId,
        userTopics: {
          some: {
            topicId: params.topicId,
          },
        },
      },
    });

    if (!findLearningHistory) {
      return NextResponse.json(
        {
          error: true,
          msg: "Learning history not found",
        },
        { status: 404 }
      );
    }

    await prisma.userLearningHistory.update({
      where: {
        id: params.progressId,
      },
      data: {
        userTopics: {
          update: {
            where: {
              topicId_userId: {
                topicId: params.topicId,
                userId: params.userId,
              },
            },
            data: {
              currentPage: page,
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        error: false,
        msg: "Current page updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user document progress:", error);
    return NextResponse.json(
      {
        error: true,
        message: "An error occurred while updating user document progress",
      },
      { status: 500 }
    );
  }
};
