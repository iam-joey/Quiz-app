import { UserTestDetailSchema } from "@/src/lib/validation";
import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();
    console.log("inside", data);
    const testSchema = await UserTestDetailSchema.safeParse(data);

    if (!testSchema.success) {
      return NextResponse.json({
        msg: testSchema.error.format(),
        err: true,
        data: null,
      });
    }

    const testDetails = testSchema.data;
    let selectedQuestions;
    let responseData;

    if (testDetails.testType === "SIMULATION") {
      const singleAnswerQuestions = await prisma.question.findMany({
        where: { categoryId: testDetails.categoryId, isMultipleAnswer: false },
        take: 50,
      });

      const multipleAnswerQuestions = await prisma.question.findMany({
        where: { categoryId: testDetails.categoryId, isMultipleAnswer: true },
        take: 150,
      });

      if (
        singleAnswerQuestions.length < 50 ||
        multipleAnswerQuestions.length < 150
      ) {
        return NextResponse.json({
          msg: "Insufficient questions available for a SIMULATION test",
          err: true,
          data: null,
        });
      }

      const simulationTestDetail = await prisma.simulationTestDetail.create({
        data: {
          userId: testDetails.userId,
          duration: testDetails.duration,
          isCompleted: false,
          testType: testDetails.testType,
          numberOfQuestions:
            singleAnswerQuestions.length + multipleAnswerQuestions.length,
          singleQuestion: {
            connect: singleAnswerQuestions.map((question) => ({
              id: question.id,
            })),
          },
          multipleQuestion: {
            connect: multipleAnswerQuestions.map((question) => ({
              id: question.id,
            })),
          },
          categoryId: testDetails.categoryId,
        },
        select: {
          id: true,
          singleQuestion: {
            select: {
              title: true,
              choice: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          },
          multipleQuestion: {
            select: {
              title: true,
              choice: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          },
          testType: true,
          createdAt: true,
          duration: true,
        },
      });

      responseData = {
        id: simulationTestDetail.id,
        singleQuestion: simulationTestDetail.singleQuestion.map(
          ({ choice, ...rest }) => ({
            ...rest,
            choice: choice.map(({ id, text }) => ({ id, text })),
          })
        ),
        multipleQuestion: simulationTestDetail.multipleQuestion.map(
          ({ choice, ...rest }) => ({
            ...rest,
            choice: choice.map(({ id, text }) => ({ id, text })),
          })
        ),
        testType: simulationTestDetail.testType,
        createdAt: simulationTestDetail.createdAt,
        duration: simulationTestDetail.duration,
      };

      return NextResponse.json({
        msg: "SIMULATION test created successfully",
        err: false,
        data: responseData,
      });
    } else {
      selectedQuestions = await prisma.question.findMany({
        where: { categoryId: testDetails.categoryId },
        take: testDetails.numberOfQuestions,
      });

      const userTestDetail = await prisma.userTestDetail.create({
        data: {
          userId: testDetails.userId,
          categoryId: testDetails.categoryId,
          numberOfQuestions: selectedQuestions.length,
          duration: testDetails.isTimed ? testDetails.duration : 0,
          isCompleted: false,
          isTimed: testDetails.isTimed,
          testType: testDetails.testType,
          question: {
            connect: selectedQuestions.map((question) => ({ id: question.id })),
          },
        },
        select: {
          id: true,
          question: {
            select: {
              id: true,
              question: true,
              choice: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          },
          testType: true,
          createdAt: true,
          duration: true,
        },
      });

      responseData = {
        id: userTestDetail.id,
        question: userTestDetail.question.map(({ choice, ...rest }) => ({
          ...rest,
          choice: choice.map(({ id, text }) => ({ id, text })),
        })),
        testType: userTestDetail.testType,
        createdAt: userTestDetail.createdAt,
        duration: userTestDetail.duration,
      };

      return NextResponse.json({
        msg: "Test created successfully",
        err: false,
        data: responseData,
      });
    }
  } catch (error) {
    console.error("Error while creating test details:", error);
    return NextResponse.json({
      msg: "Something went wrong while creating test details",
      err: true,
      data: null,
    });
  }
};
