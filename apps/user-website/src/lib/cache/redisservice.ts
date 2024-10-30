import { Redis } from "ioredis";

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
    ttl: number = 86400000
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
