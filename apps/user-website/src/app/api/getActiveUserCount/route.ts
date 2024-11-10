import RedisCache from "@/src/lib/cache/redisservice";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

const redisCache = RedisCache.getInstance();
export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const activeUserCount = await redisCache.countActiveUsers();
    return NextResponse.json({
      error: false,
      count: activeUserCount,
    });
  } catch (error) {
    console.error("Failed to fetch active user count", error);
    return NextResponse.json({
      error: true,
      message: "Failed to fetch active user count",
    });
  }
};
