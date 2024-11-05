import { NextResponse, NextRequest } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import prisma from "@repo/db/client";

//api/testhistory/[userId]?month=nov-23

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
    const { searchParams } = new URL(req.url);
    const monthYearString = searchParams.get("month");

    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    console.log(monthYearString);
    let monthIndex;
    let year;

    if (monthYearString) {
      const [monthPart, yearPart] = monthYearString.split("-");
      if (monthPart) {
        monthIndex = months.indexOf(monthPart.toLowerCase());
        console.log(monthIndex);
      } else {
        return NextResponse.json({
          msg: "Invalid month-year format. Use format like 'nov-23'.",
          err: true,
          data: null,
        });
      }
      if (monthIndex === -1 || !yearPart) {
        return NextResponse.json({
          msg: "Invalid month-year format. Use format like 'nov-23'.",
          err: true,
          data: null,
        });
      }
      year = parseInt(yearPart.length === 2 ? `20${yearPart}` : yearPart, 10);
    } else {
      // Default to current month and year
      const currentDate = new Date();
      monthIndex = currentDate.getMonth();
      console.log(monthIndex);
      year = currentDate.getFullYear();
      console.log(year);
    }

    const startDate = startOfMonth(new Date(year, monthIndex));
    const endDate = endOfMonth(new Date(year, monthIndex));

    const data = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        UserTestDetail: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
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
            createdAt: true,
          },
        },
        SimulationTestDetail: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
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
            createdAt: true,
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
      msg: "Successfully fetched the data",
      err: false,
      data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      msg: "Something went wrong while fetching tests",
      err: true,
      data: null,
    });
  }
};
