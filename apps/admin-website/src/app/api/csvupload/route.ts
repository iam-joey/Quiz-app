import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import prisma from "@repo/db/client";
import { revalidatePath } from "next/cache";

// Define types for the parsed CSV data
type CsvRecord = {
  question: string;
  choice1?: string;
  choice2?: string;
  choice3?: string;
  choice4?: string;
  choice5?: string;
  answer: string;
  level: string;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("categoryId") as string | null;

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
    const records: CsvRecord[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
    });

    const mapLevelToEnum = (level: string): "EASY" | "MEDIUM" | "HARD" => {
      return level === "1" ? "EASY" : level === "2" ? "MEDIUM" : "HARD";
    };

    // Prepare data for batch insertion
    const questionsData = records.map((record) => {
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
      const levelEnum = mapLevelToEnum(level);
      const choices = [choice1, choice2, choice3, choice4, choice5].filter(
        Boolean
      ) as string[];

      return {
        questionData: {
          title: question.substring(0, 50),
          categoryId,
          question,
          isMultipleAnswer,
          level: levelEnum,
        },
        choicesData: choices,
        answerIndices: answer
          .split(",")
          .map((index) => parseInt(index.trim()) - 1),
      };
    });

    // Batch insert questions
    const newQuestions = await prisma.$transaction(
      questionsData.map((data) =>
        prisma.question.create({
          data: data.questionData,
        })
      )
    );

    // Prepare choices for batch insertion
    const allChoicesData = questionsData.flatMap((data, index) => {
      const questionId = newQuestions[index]?.id;
      if (!questionId) return [];
      return data.choicesData.map((choiceText) => ({
        questionId,
        text: choiceText,
      }));
    });

    // Batch insert choices
    const createdChoices = await prisma.choices.createMany({
      data: allChoicesData,
    });

    // Fetch choices by question to map correct answers
    const questionChoices = await prisma.choices.findMany({
      where: {
        questionId: { in: newQuestions.map((q) => q.id) },
      },
      select: { id: true, questionId: true },
    });

    // Organise choices by question ID
    const questionChoicesMap = questionChoices.reduce<Record<string, string[]>>(
      (acc, choice) => {
        if (!acc[choice.questionId]) acc[choice.questionId] = [];
        acc[choice.questionId]!.push(choice.id);
        return acc;
      },
      {}
    );

    // Prepare answer updates for each question
    const answerUpdates = newQuestions.map((newQuestion, index) => {
      const answerIndices = questionsData[index]?.answerIndices || [];
      const correctChoiceIds = answerIndices
        .map((choiceIndex) => questionChoicesMap[newQuestion.id]?.[choiceIndex])
        .filter(Boolean);

      return prisma.question.update({
        where: { id: newQuestion.id },
        data: { answer: correctChoiceIds.filter((id): id is string => !!id) },
      });
    });

    await prisma.$transaction(answerUpdates);
    revalidatePath(`/topics/${categoryId}`);
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
