"use server";

import prisma from "@repo/db/client";

interface UserProfileUpdate {
  name?: string;
  studyProgram?: string;
  speciality?: string;
  workPlace?: string;
  university?: string;
  promotion?: string;
}

export async function updateProfile(userId: string, data: UserProfileUpdate) {
  try {
    const findUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!findUser) {
      return {
        err: true,
        msg: "User not found",
      };
    }
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return {
        err: true,
        msg: "No valid fields provided for update",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      err: false,
      msg: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      err: true,
      msg: "An error occurred while updating the profile",
    };
  }
}

export async function getProfile(userId: string) {
  try {
    const findUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        studyProgram: true,
        speciality: true,
        workPlace: true,
        university: true,
        promotion: true,
        image: true,
        isPremium: true,
        email: true,
      },
    });
    if (!findUser) {
      return {
        err: true,
        msg: "User not found",
        data: null,
      };
    }

    return {
      err: false,
      msg: "Profile fetched successfully",
      data: findUser,
    };
  } catch (error) {
    console.error("Error getting profile:", error);
    return {
      err: true,
      msg: "An error occurred while getting the profile",
      data: null,
    };
  }
}
