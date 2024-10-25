import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { userId: string };
  }
) => {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { error: true, message: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const userReadingHistory = await prisma.userLearningHistory.findMany({
      where: {
        userId: userId,
      },
      include: {
        userTopics: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!userReadingHistory.length) {
      return NextResponse.json({
        error: false,
        msg: "No reading history found for the user",
        data: null,
      });
    }

    return NextResponse.json({
      error: false,
      msg: "User's reading history fetched successfully",
      data: userReadingHistory,
    });
  } catch (error) {
    console.error("Error fetching user's reading history:", error);
    return NextResponse.json({
      error: true,
      message: "An error occurred while fetching user's reading history",
      data: null,
    });
  }
};
