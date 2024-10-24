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
    const { userId, topicId } = params;

    if (!userId || !topicId) {
      return NextResponse.json(
        { error: true, message: "Missing userId or topicId parameter" },
        { status: 400 }
      );
    }

    const { currentPage } = await req.json();

    if (typeof currentPage !== "number" || currentPage < 0) {
      return NextResponse.json(
        { error: true, message: "Invalid currentPage parameter" },
        { status: 400 }
      );
    }

    // Step 1: Check if the topic has a document
    const document = await prisma.document.findUnique({
      where: { topicId },
    });

    if (!document) {
      return NextResponse.json(
        { error: true, message: "No document found for the given topicId" },
        { status: 404 }
      );
    }

    const userProgress = await prisma.userDocumentProgress.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId: document.id,
        },
      },
    });

    if (!userProgress) {
      return NextResponse.json(
        {
          error: true,
          message: "No reading progress found for this user and document",
        },
        { status: 404 }
      );
    }

    const updatedProgress = await prisma.userDocumentProgress.update({
      where: {
        userId_documentId: {
          userId,
          documentId: document.id,
        },
      },
      data: {
        currentPage: currentPage,
        completedAt: currentPage >= document.totalPages ? new Date() : null,
      },
    });

    return NextResponse.json({
      error: false,
      message: "progress updated successfully",
      data: updatedProgress,
    });
  } catch (error) {
    console.error("Error updating user document progress:", error);
    return NextResponse.json(
      {
        error: true,
        message: "An error occurred while updating user document progress",
      },
      { status: 500 }
    );
  }
};
