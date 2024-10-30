import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

// export const dynamic = "force-dynamic"

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: {
      testid: string;
      testType: string;
    };
  }
) => {
  console.log("GET request for test", params.testid);
  console.log("testType", params.testType);
  try {
    if (params.testType === "TIMER" || params.testType === "NOTIMER") {
      console.log("Fetching test data for testType:", params.testType);
      const testData = await prisma.userTestDetail.findUnique({
        where: {
          id: params.testid,
          testType: params.testType,
        },
        select: {
          isCompleted: true,
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
              answer: true,
              level: true,
            },
          },
          duration: true,
          userAnswers: true,
          isTimed: true,
          numberOfQuestions: true,
          id: true,
          testType: true,
          score: true,
          correctAnswers: true,
          incorrectAnswers: true,
          totalTimeTaken: true,
          accuracy: true,
          createdAt: true,
          percentage: true,
        },
      });
      if (!testData) {
        return NextResponse.json({
          msg: "Invalid test id",
          err: true,
          data: null,
        });
      }

      const responseData = testData.isCompleted
        ? testData
        : {
            ...testData,
            question: testData.question.map(({ answer, ...rest }) => rest),
            userAnswers: [],
            score: undefined,
            correctAnswers: undefined,
            incorrectAnswers: undefined,
            totalTimeTaken: undefined,
            accuracy: undefined,
            percentage: undefined,
          };

      return NextResponse.json({
        msg: "Fetched the test details",
        err: false,
        data: responseData,
      });
    } else {
      console.log("inside simulation test");
      const testDetail = await prisma.simulationTestDetail.findUnique({
        where: {
          id: params.testid,
        },
        select: {
          isCompleted: true,
          singleQuestion: {
            select: {
              id: true, // Include questionId
              title: true,
              choice: {
                select: {
                  id: true,
                  text: true,
                },
              },
              answer: true,
              level: true, // Include level for each question
            },
          },
          multipleQuestion: {
            select: {
              id: true, // Include questionId
              title: true,
              choice: {
                select: {
                  id: true,
                  text: true,
                },
              },
              answer: true,
              level: true, // Include level for each question
            },
          },
          userAnswers: true,
          score: true,
          correctAnswers: true,
          incorrectAnswers: true,
          totalTimeTaken: true,
          accuracy: true,
          createdAt: true,
          percentage: true,
        },
      });
      if (!testDetail) {
        return NextResponse.json({
          msg: "Invalid testId",
          err: true,
          data: null,
        });
      }

      const responseData = testDetail.isCompleted
        ? testDetail
        : {
            ...testDetail,
            singleQuestion: testDetail.singleQuestion.map(
              ({ id, answer, ...rest }) => ({
                questionId: id, // Rename id to questionId
                ...rest,
              })
            ),
            multipleQuestion: testDetail.multipleQuestion.map(
              ({ id, answer, ...rest }) => ({
                questionId: id, // Rename id to questionId
                ...rest,
              })
            ),
            userAnswers: [],
            score: undefined,
            correctAnswers: undefined,
            incorrectAnswers: undefined,
            totalTimeTaken: undefined,
            accuracy: undefined,
            percentage: undefined,
          };

      return NextResponse.json({
        msg: "Fetched the test details",
        err: false,
        data: responseData,
      });
    }
  } catch (error) {
    console.error("Error fetching test details:", error);
    return NextResponse.json({
      msg: "Something went wrong while fetching",
      err: true,
      data: null,
    });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { testid, testType, answers } = await req.json();

    if (!testid || !testType || !Array.isArray(answers)) {
      return NextResponse.json({
        msg: "Invalid data provided",
        err: true,
        data: null,
      });
    }

    let testData;
    console.log("answers", answers);
    // Fetch the test data based on test type
    if (testType === "SIMULATION") {
      testData = await prisma.simulationTestDetail.findUnique({
        where: { id: testid },
        select: {
          singleQuestion: { select: { id: true, answer: true } },
          multipleQuestion: { select: { id: true, answer: true } },
          createdAt: true,
          duration: true,
        },
      });
    } else {
      testData = await prisma.userTestDetail.findUnique({
        where: { id: testid },
        select: {
          question: { select: { id: true, answer: true } },
          createdAt: true,
          duration: true,
        },
      });
    }

    if (!testData) {
      return NextResponse.json({
        msg: "Invalid test ID or test not found",
        err: true,
        data: null,
      });
    }

    const questions =
      testType === "SIMULATION"
        ? //@ts-ignore
          [...testData.singleQuestion, ...testData.multipleQuestion]
        : //@ts-ignore
          testData.question;

    let correctAnswers = 0;

    //@ts-ignore
    questions.forEach((question, index) => {
      const correctAnswerIds = question.answer;
      const userAnswerIds = answers[index] || [];
      const isCorrect =
        correctAnswerIds.length === userAnswerIds.length &&
        correctAnswerIds.every((id: any) => userAnswerIds.includes(id));
      if (isCorrect) correctAnswers++;
    });
    console.log("correctAnswers", correctAnswers);
    // Calculate metrics and round them
    const roundedScore = Math.round((correctAnswers / questions.length) * 100);
    const roundedAccuracy = Math.round((correctAnswers / answers.length) * 100);
    const percentage = Math.round((correctAnswers / questions.length) * 100);

    // Create update data without percentage first
    const baseUpdateData = {
      userAnswers: answers,
      isCompleted: true,
      score: roundedScore,
      correctAnswers,
      incorrectAnswers: questions.length - correctAnswers,
      accuracy: roundedAccuracy,
      totalTimeTaken: 0,
      percentage,
    };

    if (testType === "SIMULATION") {
      await prisma.simulationTestDetail.update({
        where: { id: testid },
        data: baseUpdateData,
      });
    } else {
      await prisma.userTestDetail.update({
        where: { id: testid },
        data: baseUpdateData,
      });
    }

    return NextResponse.json({
      msg: "Test results updated successfully",
      err: false,
      data: {
        ...baseUpdateData,
        percentage,
      },
    });
  } catch (error) {
    console.error("Error updating test results:", error);
    return NextResponse.json({
      msg: "Something went wrong while updating test results",
      err: true,
      data: null,
    });
  }
};
