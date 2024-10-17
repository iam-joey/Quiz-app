import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

interface FlagData {
  comment?: string;
  resolved?: boolean;
}

export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: {
      flagid: string;
    };
  }
) => {
  try {
    const flagId = params.flagid;
    const data: FlagData = await req.json();

    if (data.resolved === undefined && !data.comment) {
      return NextResponse.json({
        error: true,
        msg: "Please provide a comment or resolved status",
      });
    }

    const flag = await prisma.flag.findUnique({
      where: {
        id: flagId,
      },
    });
    if (!flag) {
      return NextResponse.json({
        error: true,
        msg: "Flag not found",
      });
    }
    if (flag.resolved) {
      return NextResponse.json({
        error: true,
        msg: "Flag already resolved",
      });
    }

    await prisma.flag.update({
      where: {
        id: flagId,
      },
      data: {
        resolved: true,
        comment: data.comment,
      },
    });
    return NextResponse.json({ error: false, msg: "Flag updated" });
  } catch (error) {
    return NextResponse.json({
      error: true,
      msg: "Something went wrong while updating the flag",
    });
  }
};
