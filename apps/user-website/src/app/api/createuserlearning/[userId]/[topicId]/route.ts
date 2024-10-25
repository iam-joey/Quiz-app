import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { userId: string; topicId: string };
  }
) => {
  try {
    const userId = params.userId;
    const topicId = params.topicId;

    if (!userId) {
      return NextResponse.json(
        { error: true, message: "Missing userId parameter" },
        { status: 400 }
      );
    }

    if (!topicId) {
      return NextResponse.json(
        { error: true, message: "Missing topicId parameter" },
        { status: 400 }
      );
    }

    // Find the user
    const findUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: true, message: "No user found for the given userId" },
        { status: 404 }
      );
    }

    const findTopic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        document: true,
      },
    });

    if (!findTopic) {
      return NextResponse.json(
        { error: true, message: "No topic found for the given topicId" },
        { status: 404 }
      );
    }

    const document = findTopic.document;

    if (!document) {
      return NextResponse.json(
        { error: true, message: "No document found for the given topic" },
        { status: 404 }
      );
    }

    const existingProgress = await prisma.userDocumentProgress.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId: document.id,
        },
      },
    });

    if (existingProgress) {
      return NextResponse.json(
        { error: true, message: "User already has progress for this document" },
        { status: 400 }
      );
    }

    const userlearning = await prisma.userDocumentProgress.create({
      data: {
        userId: userId,
        topicId: topicId,
        documentId: document.id,
        currentPage: 0,
        totalPages: document.totalPages,
      },
    });

    return NextResponse.json({
      error: false,
      message: "User document progress created successfully",
      userlearning,
    });
  } catch (error) {
    console.error("Error creating user document progress:", error);
    return NextResponse.json(
      {
        error: true,
        message: "An error occurred while creating user document progress",
      },
      { status: 500 }
    );
  }
};
