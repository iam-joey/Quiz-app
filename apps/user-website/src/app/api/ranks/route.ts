import prisma from "@repo/db/client";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// api/ranks
// this is the typs of topUser const topUsers: {
//   id: string;
//   name: string;
//   grade: number;
// }[];
export const GET = async (req: NextRequest) => {
  try {
    // Use raw SQL to retrieve top 50 users by grade
    const topUsers = await prisma.$queryRaw<
      { id: string; name: string; grade: number }[]
    >`
      SELECT u.id, u.name, COALESCE(AVG(utd."percentage"), 0) / 10 AS grade
      FROM "User" u
      LEFT JOIN "UserTestDetail" utd ON u.id = utd."userId"
      GROUP BY u.id
      ORDER BY grade DESC
      LIMIT 50;
    `;

    return Response.json({
      error: false,
      msg: "Top 50 leaderboard fetched successfully",
      data: topUsers,
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      error: true,
      msg: "Error fetching leaderboard",
      data: null,
    });
  }
};
