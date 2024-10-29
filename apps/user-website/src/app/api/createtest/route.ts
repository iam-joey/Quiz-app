import RedisCache from "@/src/lib/cache/redisservice";
import { UserTestDetailSchema } from "@/src/lib/validation";
import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

const redisCache = RedisCache.getInstance();

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();
    const testSchema = await UserTestDetailSchema.safeParse(data);

    if (!testSchema.success) {
      return NextResponse.json({
        msg: testSchema.error.format(),
        err: true,
        data: null,
      });
    }

    const testDetails = testSchema.data;
    let responseData;

    const calculateQuestionDistribution = (totalQuestions: number) => {
      const easyQuestions = Math.ceil(totalQuestions * 0.4);
      const mediumQuestions = Math.ceil(totalQuestions * 0.4);
      const hardQuestions = totalQuestions - (easyQuestions + mediumQuestions);
      return { easyQuestions, mediumQuestions, hardQuestions };
    };

    const fetchQuestions = async (
      categoryId: string,
      numberOfQuestions: number
    ) => {
      const cacheKey = `questions:${categoryId}:${numberOfQuestions}`;
      let cachedQuestions =
        await redisCache.get<
          Array<{ id: string; question: string; choice: any[]; level: string }>
        >(cacheKey);

      if (cachedQuestions && cachedQuestions.length) {
        console.log(
          `Cache hit for category ${categoryId} with ${numberOfQuestions} questions`
        );
        return cachedQuestions;
      }

      console.log(
        `Cache miss for category ${categoryId} with ${numberOfQuestions} questions`
      );

      const totalEasy = await prisma.question.count({
        where: {
          categoryId,
          level: "EASY",
          category: { deleted: false },
        },
      });
      console.log("totalEasy", totalEasy);
      const totalMedium = await prisma.question.count({
        where: {
          categoryId,
          level: "MEDIUM",
          category: { deleted: false },
        },
      });
      console.log("totalMedium", totalMedium);
      const totalHard = await prisma.question.count({
        where: {
          categoryId,
          level: "HARD",
          category: { deleted: false },
        },
      });
      console.log("totalHard", totalHard);
      const totalAvailable = totalEasy + totalMedium + totalHard;

      let easyQuestions = 0;
      let mediumQuestions = 0;
      let hardQuestions = 0;

      if (numberOfQuestions < totalAvailable) {
        const distribution = calculateQuestionDistribution(numberOfQuestions);
        easyQuestions = distribution.easyQuestions;
        mediumQuestions = distribution.mediumQuestions;
        hardQuestions = distribution.hardQuestions;
      } else {
        easyQuestions = totalEasy;
        mediumQuestions = totalMedium;
        hardQuestions = totalHard;
      }

      const easy = await prisma.question.findMany({
        where: { categoryId, level: "EASY", category: { deleted: false } },
        take: easyQuestions,
        select: {
          id: true,
          question: true,
          choice: { select: { id: true, text: true } },
          level: true,
        },
      });
      console.log("easy", easy.length);

      const medium = await prisma.question.findMany({
        where: { categoryId, level: "MEDIUM", category: { deleted: false } },
        take: mediumQuestions,
        select: {
          id: true,
          question: true,
          choice: { select: { id: true, text: true } },
          level: true,
        },
      });
      console.log("medium", medium.length);

      const hard = await prisma.question.findMany({
        where: { categoryId, level: "HARD", category: { deleted: false } },
        take: hardQuestions,
        select: {
          id: true,
          question: true,
          choice: { select: { id: true, text: true } },
          level: true,
        },
      });
      console.log("hard", hard.length);

      const selectedQuestions = [...easy, ...medium, ...hard].sort(
        () => 0.5 - Math.random()
      );

      console.log("selectedQuestions", selectedQuestions.length);

      await redisCache.set(cacheKey, selectedQuestions);
      return selectedQuestions;
    };

    if (testDetails.testType === "SIMULATION") {
      const singleAnswerQuestions = await prisma.question.findMany({
        where: { isMultipleAnswer: false, category: { deleted: false } },
        take: 50,
        select: {
          id: true,
          title: true,
          choice: { select: { id: true, text: true } },
          level: true,
        },
      });

      const multipleAnswerQuestions = await prisma.question.findMany({
        where: { isMultipleAnswer: true, category: { deleted: false } },
        take: 150,
        select: {
          id: true,
          title: true,
          choice: { select: { id: true, text: true } },
          level: true,
        },
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
            connect: singleAnswerQuestions.map((q) => ({ id: q.id })),
          },
          multipleQuestion: {
            connect: multipleAnswerQuestions.map((q) => ({ id: q.id })),
          },
        },
        select: {
          id: true,
          singleQuestion: {
            select: {
              id: true,
              title: true,
              choice: { select: { id: true, text: true } },
              level: true,
            },
          },
          multipleQuestion: {
            select: {
              id: true,
              title: true,
              choice: { select: { id: true, text: true } },
              level: true,
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
          ({ id, title, choice, level }) => ({
            questionId: id,
            title,
            level,
            choice: choice.map(({ id, text }) => ({ id, text })),
          })
        ),
        multipleQuestion: simulationTestDetail.multipleQuestion.map(
          ({ id, title, choice, level }) => ({
            questionId: id,
            title,
            level,
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
      const selectedQuestions = await fetchQuestions(
        testDetails.categoryId,
        testDetails.numberOfQuestions
      );

      const userTestDetail = await prisma.userTestDetail.create({
        data: {
          userId: testDetails.userId,
          categoryId: testDetails.categoryId,
          numberOfQuestions: selectedQuestions.length,
          duration: testDetails.isTimed ? testDetails.duration : 0,
          isCompleted: false,
          isTimed: testDetails.isTimed,
          testType: testDetails.testType,
          question: { connect: selectedQuestions.map((q) => ({ id: q.id })) },
        },
        select: {
          id: true,
          question: {
            select: {
              id: true,
              question: true,
              choice: { select: { id: true, text: true } },
              level: true,
            },
          },
          testType: true,
          createdAt: true,
          duration: true,
        },
      });
      console.log("userTestDetail", userTestDetail.question.length);

      responseData = {
        id: userTestDetail.id,
        question: userTestDetail.question.map(({ choice, level, ...rest }) => ({
          ...rest,
          level,
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
    console.error("Error in POST request:", error);
    return NextResponse.json({
      msg: "An error occurred",
      err: true,
      data: null,
    });
  }
};
