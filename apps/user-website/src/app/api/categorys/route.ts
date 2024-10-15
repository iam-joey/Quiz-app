import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const data = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        question: {
          select: {
            id: true,
          },
        },
      },
    });
    return NextResponse.json({
      msg: "Categories fetched successfully",
      err: false,
      data,
    });
  } catch (error) {
    return NextResponse.json({
      msg: "Seomthing went wrong while fetching the topics",
      err: false,
      data: null,
    });
  }
};
