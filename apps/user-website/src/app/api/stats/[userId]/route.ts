import prisma from "@repo/db/client";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

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
    const data = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        UserTestDetail: {
          select: {
            percentage: true,
          },
        },
      },
    });

    if (!data) {
      return Response.json({
        error: true,
        msg: "user not found or no test data available",
        data: null,
      });
    }

    if (data.UserTestDetail.length === 0) {
      return Response.json({
        error: false,
        msg: "no test data available for this user",
        data: 0,
      });
    }

    const percentages = data.UserTestDetail.map((test) => test.percentage);

    const averagePercentage =
      percentages.reduce((sum, value) => sum + value, 0) / percentages.length;

    const grade = averagePercentage / 10;

    return Response.json({
      error: false,
      msg: "stats fetched successfully",
      data: {
        grade: grade.toFixed(2),
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      error: true,
      msg: "error fetching stats",
      data: null,
    });
  }
};
