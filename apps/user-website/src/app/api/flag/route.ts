import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

interface FlagData {
  questionId: string;
  flagReason: string;
  userId: string;
}

export const POST = async (req: NextRequest) => {
  try {
    console.log("Flagging question");
    const data: FlagData = await req.json();
    console.log("Flag data:", data);
    if (
      data.questionId === undefined ||
      data.flagReason === undefined ||
      data.userId === undefined
    ) {
      return NextResponse.json({
        error: true,
        msg: "Missing required fields",
      });
    }

    const question = await prisma.question.findUnique({
      where: {
        id: data.questionId,
      },
    });
    if (!question) {
      console.log("Question not found");
      return NextResponse.json({
        error: true,
        msg: "Question not found",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });

    if (!user) {
      return NextResponse.json({
        error: true,
        msg: "User not found",
      });
    }

    await prisma.flag.create({
      data: {
        questionId: data.questionId,
        description: data.flagReason,
        userId: data.userId,
      },
    });

    return NextResponse.json({ error: false, msg: "Successfully reported" });
  } catch (error) {
    console.log("Error creating topic:", error);
    return NextResponse.json({ error: true, msg: "Something went wrong" });
  }
};
