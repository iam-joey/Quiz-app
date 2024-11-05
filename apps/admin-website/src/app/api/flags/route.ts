import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
//api/flags?resolved= true or false  (if true, get all resolved flags, if false get all unresolved flags)

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const resolvedParam = url.searchParams.get("resolved");
    const resolved = resolvedParam === "true";
    const flags = await prisma.flag.findMany({
      where: {
        resolved: resolved,
      },
      select: {
        id: true,
        description: true,
        questionId: true,
        userId: true,
        resolved: true,
        comment: true,
      },
    });
    return NextResponse.json({ error: false, flags });
  } catch (error) {
    console.log("Error getting flags:", error);
    return NextResponse.json({ error: true, msg: "Something went wrong" });
  }
};
