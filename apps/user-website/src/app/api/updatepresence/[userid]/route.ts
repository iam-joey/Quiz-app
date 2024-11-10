import RedisCache from "@/src/lib/cache/redisservice";
import { NextRequest, NextResponse } from "next/server";

const redisCache = RedisCache.getInstance();
export const dynamic = "force-dynamic";

export const POST = async (
  req: NextRequest,
  { params }: { params: { userid: string } }
) => {
  try {
    const userId = params.userid;
    await redisCache.refreshUserSession(userId, 300);
    return NextResponse.json({
      error: false,
      message: "User presence updated",
    });
  } catch (error) {
    console.error("Failed to update user presence", error);
    return NextResponse.json({
      error: true,
      message: "Failed to update user presence",
    });
  }
};
