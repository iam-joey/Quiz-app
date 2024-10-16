import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const data = await prisma.category.findMany({
      where: {
        deleted: false,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            question: true,
          },
        },
      },
    });

    const formattedCategories = data.map(category => ({
      id: category.id,
      name: category.name,
      questionCount: category._count.question,
    }));

    return NextResponse.json({
      msg: "Categories fetched successfully",
      err: false,
      data: formattedCategories,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      msg: "Something went wrong while fetching the categories",
      err: true,
      data: null,
    });
  }
};
