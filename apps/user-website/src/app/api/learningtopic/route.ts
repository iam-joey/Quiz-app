import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest) => {
  try {
    const data = await prisma.topic.findMany({
      where: {
        docfileName: {
          not: null,
        },
      },
    });

    return NextResponse.json({
      err: false,
      data,
      msg: "Topics with documents fetched successfully",
    });
  } catch (error) {
    console.error("Error while fetching topics with documents", error);
    return NextResponse.json({
      err: true,
      msg: "Error while fetching topics with documents",
      data: null,
    });
  }
};
