import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: {
      userId: string;
    };
  }
) => {
  try {
    console.log("inside", params.userId);
    const data = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        UserTestDetail: {
          select: {
            isCompleted: true,
            correctAnswers: true,
            category: {
              select: {
                name: true,
              },
            },
            id: true,
            numberOfQuestions: true,
            testType: true,
          },
        },
        SimulationTestDetail: {
          select: {
            isCompleted: true,
            correctAnswers: true,
            category: {
              select: {
                name: true,
              },
            },
            id: true,
            numberOfQuestions: true,
            testType: true,
          },
        },
      },
    });

    if (!data) {
      return NextResponse.json({
        msg: "Invalid User",
        err: true,
        data: null,
      });
    }
    return NextResponse.json({
      msg: "successfull fetcehed the data",
      err: false,
      data,
    });
  } catch (error) {
    return NextResponse.json({
      msg: "Something went wrong while fetching tests",
      err: true,
      data: null,
    });
  }
};
