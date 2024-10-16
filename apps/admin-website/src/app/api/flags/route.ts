import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const flags = await prisma.flag.findMany({
      where: {
        resolved: false,
      },
      select: {
        id: true,
        description: true,
        questionId: true,
        userId: true,
        resolved: true,
      },
    });
    return NextResponse.json({ error: false, flags });
  } catch (error) {
    console.log("Error getting flags:", error);
    return NextResponse.json({ error: true, msg: "Something went wrong" });
  }
};
