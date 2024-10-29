import { Redis } from "ioredis";

// class RedisCache {
//   private redis: Redis;

//   constructor() {
//     this.redis =
//   }

//   async getQuestionsByCategory(categoryId: string) {
//     console.log("Fetching from cache");
//     const cachedData = await this.redis.get(`questions:${categoryId}`);
//     return cachedData ? JSON.parse(cachedData) : null;
//   }

//   async setQuestionsByCategory(categoryId: string, questions: any) {
//     console.log("Setting cache");
//     await this.redis.set(
//       `questions:${categoryId}`,
//       JSON.stringify(questions),
//       "EX",
//       3600 // 1 hour
//     );
//   }

//   async getSimulationQuestions(type: "singleAnswer" | "multipleAnswer") {
//     console.log("Fetching from cache");
//     const cachedData = await this.redis.get(`simulation:${type}`);
//     return cachedData ? JSON.parse(cachedData) : null;
//   }

//   async setSimulationQuestions(
//     type: "singleAnswer" | "multipleAnswer",
//     questions: any
//   ) {
//     console.log("Setting cache");
//     await this.redis.set(
//       `simulation:${type}`,
//       JSON.stringify(questions),
//       "EX",
//       3600 // 1 hour
//     );
//   }
// }

class RedisCache {
  private static instance: RedisCache;
  private client: Redis;

  private constructor() {
    this.client = new Redis(
      "rediss://default:AVilAAIjcDEzZWZiMDFlNzRmZmY0YzA2OTZlN2ExNDE3Y2JkMTJhNnAxMA@intense-gull-22693.upstash.io:6379"
    );
  }

  public static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  public async set(
    key: string,
    value: any,
    ttl: number = 360000
  ): Promise<void> {
    console.log("Setting cache");
    await this.client.set(key, JSON.stringify(value), "EX", ttl);
  }

  public async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    console.log("Fetching from cache");
    return data ? JSON.parse(data) : null;
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async clearCategoryCache(categoryId: string): Promise<void> {
    const keys = await this.client.keys(`questions:${categoryId}:*`);
    if (keys.length) {
      await this.client.del(...keys);
    }
  }
}

export default RedisCache;
