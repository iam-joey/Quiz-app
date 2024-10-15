"use server";
import prisma from "@repo/db/client";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function createAdmin(email: string, pwd: string) {
  try {
    const hashedPassword = await bcrypt.hash(pwd, 10);

    await prisma.admin.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    console.log("Admin created successfully!");
  } catch (error) {
    console.log("Error creating admin:", error);
  }
}

export async function createTopic(formdata: FormData) {
  try {
    let TopicName = formdata.get("topicName") as string;
    const name = TopicName.trim().replace(/\s+/g, "_").toLowerCase();

    if (name.includes(" ")) {
      return {
        err: true,
        data: null,
        msg: "Something went wrong",
      };
    }
    const isPresent = await prisma.category.findUnique({
      where: {
        name: TopicName,
      },
    });
    if (isPresent) {
      return {
        err: true,
        data: null,
        msg: "Topic already present",
      };
    }
    const data = await prisma.category.create({
      data: {
        name: TopicName,
      },
    });
    revalidatePath("/");
    return {
      err: false,
      msg: "Successfully created",
      data,
    };
  } catch (error) {
    return {
      err: true,
      data: null,
      msg: "Something went wrong while creating topic",
    };
  }
}

export async function getTopics() {
  const data = await prisma.category.findMany({
    include: {
      question: true,
    },
    where: {
      deleted: false,
    },
  });
  return {
    err: false,
    msg: "All good",
    data,
  };
}

export async function getQuestionsRange(
  topicId: string,
  limit: number,
  page: number = 1
) {
  try {
    const skip = (page - 1) * limit;
    const data = await prisma.question.findMany({
      where: {
        categoryId: topicId,
      },
      include: {
        choice: true,
      },
      skip: skip,
      take: limit,
    });

    const totalQuestions = await prisma.question.count({
      where: {
        categoryId: topicId,
      },
    });

    const totalPages = Math.ceil(totalQuestions / limit);

    return {
      data,
      total: totalQuestions,
      totalPages,
      currentPage: page,
      pageSize: limit,
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions");
  }
}

export async function getQuestion(id: string) {
  try {
    const data = await prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        choice: true,
      },
    });
    return {
      msg: "fetched successfully",
      err: false,
      data,
    };
  } catch (error) {
    return {
      msg: "Something went wrong",
      err: true,
      data: null,
    };
  }
}

export async function editQuestion(questionId: string) {
  try {
    const findId = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!findId) {
      return {
        msg: "Choice not present in db",
        err: true,
        data: null,
      };
    }

    await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {},
    });
  } catch (error) {
    return {
      msg: "Seomthing went wrong while editing",
      err: true,
      data: null,
    };
  }
}

export async function deleteChoice(choiceId: string) {
  try {
    const findId = await prisma.choices.findUnique({
      where: {
        id: choiceId,
      },
    });

    if (!findId) {
      return {
        msg: "Choice not present in db",
        err: true,
        data: null,
      };
    }

    await prisma.choices.delete({
      where: {
        id: choiceId,
      },
    });

    return {
      msg: "Choice deleted",
      err: false,
      data: "",
    };
  } catch (error) {
    return {
      msg: "Something went wrong while deleteing",
      err: true,
      data: null,
    };
  }
}

interface ChoiceInput {
  id?: string;
  text: string;
}

interface UpdateQuestionInput {
  id: string;
  title: string;
  categoryId: string;
  question: string;
  choices: ChoiceInput[];
  answer: string[];
}

export async function updateQuestion(questionData: UpdateQuestionInput) {
  try {
    const findId = await prisma.question.findUnique({
      where: {
        id: questionData.id,
      },
    });
    if (!findId) {
      return {
        err: true,
        msg: "Question not present in db",
      };
    }
    const updatedQuestion = await prisma.question.update({
      where: { id: questionData.id },
      data: {
        title: questionData.title,
        categoryId: questionData.categoryId,
        question: questionData.question,
        answer: questionData.answer,
        choice: {
          upsert: questionData.choices.map((choice) => ({
            where: { id: choice.id || "" },
            update: { text: choice.text },
            create: { text: choice.text },
          })),
        },
      },
      include: {
        category: true,
        choice: true,
      },
    });

    const choiceIdsToKeep = new Set(
      questionData.choices.map((c) => c.id).filter(Boolean)
    );
    const choicesToDelete = updatedQuestion.choice.filter(
      (c) => !choiceIdsToKeep.has(c.id)
    );

    if (choicesToDelete.length > 0) {
      await prisma.choices.deleteMany({
        where: {
          id: { in: choicesToDelete.map((c) => c.id) },
        },
      });
    }

    return { err: false, msg: "Successfully updated" };
  } catch (error) {
    console.error("Error updating question:", error);
    return { err: true, msg: "Failed to update question" };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if the category exists
    const findId = await prisma.category.findUnique({
      where: { id },
    });

    if (!findId) {
      return {
        msg: "Category not present in db",
        err: true,
      };
    }

    await prisma.category.update({
      where: { id },
      data: {
        deleted: true,
        name: "deleted_" + findId.name + "_" + Date.now(),
      },
    });

    revalidatePath("/topics");

    return {
      msg: "Category successfully deleted",
      err: false,
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { err: true, msg: "Failed to delete the category" };
  }
}
