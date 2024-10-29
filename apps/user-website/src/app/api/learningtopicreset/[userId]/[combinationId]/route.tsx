import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

//endpoint is used to delete the topics from the user learning history
//api/learningtopicreset/[userId]/[combinationId]

export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: {
      userId: string;
      combinationId: string;
    };
  }
) => {
  try {
    const { userId, combinationId } = params;

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      return NextResponse.json({
        err: true,
        message: "User not found",
      });
    }

    const findCombination = await prisma.userLearningHistory.findUnique({
      where: {
        id: combinationId,
        userId: userId,
      },
      include: {
        userTopics: true,
      },
    });

    if (!findCombination) {
      return NextResponse.json({
        err: true,
        message: "Inavlid user learning history id",
      });
    }

    if (findCombination.userTopics.length === 0) {
      return NextResponse.json({
        err: true,
        message: "No topics found to delete",
      });
    }

    await prisma.userLearningHistory.delete({
      where: {
        id: combinationId,
        userId: userId,
      },
    });

    return NextResponse.json({
      err: false,
      message: "Topics deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      err: true,
      message: "Something went wrong",
    });
  }
};
