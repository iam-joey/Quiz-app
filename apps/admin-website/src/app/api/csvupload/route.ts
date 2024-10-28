import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import prisma from "@repo/db/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const content = await file.text();
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const mapLevelToEnum = (level: string) => {
      switch (level) {
        case "1":
          return "EASY";
        case "2":
          return "MEDIUM";
        case "3":
          return "HARD";
        default:
          return "EASY";
      }
    };

    for (const record of records) {
      const {
        question,
        choice1,
        choice2,
        choice3,
        choice4,
        choice5,
        answer,
        level,
      } = record;
      const isMultipleAnswer = answer.includes(",");
      console.log("the answer and leve is", answer, level);
      const levelEnum = mapLevelToEnum(level);
      console.log("the level enum is", levelEnum);
      const newQuestion = await prisma.question.create({
        data: {
          title: question.substring(0, 50),
          categoryId: categoryId,
          question: question,
          isMultipleAnswer: isMultipleAnswer,
          level: levelEnum,
        },
      });

      const choices = [choice1, choice2, choice3, choice4, choice5].filter(
        Boolean
      );

      const createdChoices = await Promise.all(
        choices.map((choiceText) =>
          prisma.choices.create({
            data: {
              questionId: newQuestion.id,
              text: choiceText,
            },
          })
        )
      );

      const answerIndices = answer
        .split(",")
        .map((index: any) => parseInt(index.trim()) - 1);
      const correctChoiceIds = answerIndices
        .map((index: any) =>
          createdChoices[index] ? createdChoices[index].id : null
        )
        .filter(Boolean);

      if (correctChoiceIds.length > 0) {
        await prisma.question.update({
          where: { id: newQuestion.id },
          data: { answer: correctChoiceIds },
        });
      }
    }

    return NextResponse.json({
      message: "Questions, choices, and levels uploaded successfully",
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Error processing file" },
      { status: 500 }
    );
  }
}
