import { updateQuestion } from "@/src/lib/actions";
import prisma from "@repo/db/client";
import { NextResponse } from "next/server";

// POST /api/updatequestion/[questionId]
//also send the questiondata in the body

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: {
      questionId: string;
    };
  }
) {
  try {
    const questionData = await req.json();

    if (!questionData.question || !questionData.choice || !questionData.title) {
      return NextResponse.json({
        err: true,
        msg: "Question data is incomplete or invalid",
      });
    }

    const findId = await prisma.question.findUnique({
      where: {
        id: params.questionId,
      },
    });

    if (!findId) {
      return NextResponse.json(
        { err: true, msg: "Question not present in db" },
        { status: 404 }
      );
    }

    const updatedQuestion = await prisma.$transaction(async (prisma) => {
      const updatedQuestionData = await prisma.question.update({
        where: { id: params.questionId },
        data: {
          title: questionData.title,
          categoryId: questionData.categoryId,
          question: questionData.question,
          answer: questionData.answer,
        },
        include: {
          category: true,
          choice: true,
        },
      });

      const choicePromises = questionData.choice.map(async (choice: any) => {
        return prisma.choices.upsert({
          where: { id: choice.id },
          update: { text: choice.text },
          create: {
            id: choice.id,
            text: choice.text,
            questionId: params.questionId,
          },
        });
      });

      await Promise.all(choicePromises);

      return prisma.question.findUnique({
        where: { id: params.questionId },
        include: {
          category: true,
          choice: true,
        },
      });
    });

    return NextResponse.json(
      { err: false, msg: "Successfully updated", data: updatedQuestion },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { err: true, msg: "Failed to update question" },
      { status: 500 }
    );
  }
}
