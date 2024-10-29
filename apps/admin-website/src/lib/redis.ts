// lib/redis/RedisQuestionCache.ts
import { Redis } from "ioredis";
import { Question, Level } from "@prisma/client";
import prisma from "@repo/db/client";

interface QuestionWithChoices {
  id: string;
  question?: string;
  title?: string;
  choice: {
    id: string;
    text: string;
  }[];
  level: Level;
}

class RedisQuestionCache {
  private redis: Redis;
  private readonly TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor() {
    this.redis = new Redis(
      "rediss://default:AVilAAIjcDEzZWZiMDFlNzRmZmY0YzA2OTZlN2ExNDE3Y2JkMTJhNnAxMA@intense-gull-22693.upstash.io:6379"
    );

    this.redis.on("error", (error) => {
      console.error("Redis connection error:", error);
    });
  }

  private generateKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value}`)
      .join(":");
    return `questions:${type}:${sortedParams}`;
  }

  async getQuestionsFromCache(
    key: string
  ): Promise<QuestionWithChoices[] | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setQuestionsToCache(
    key: string,
    questions: QuestionWithChoices[]
  ): Promise<void> {
    await this.redis.setex(key, this.TTL, JSON.stringify(questions));
  }

  async getAllQuestionsByCategory(
    categoryId: string
  ): Promise<QuestionWithChoices[]> {
    const cacheKey = this.generateKey("category", { categoryId });

    const cached = await this.getQuestionsFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const questions = await prisma.question.findMany({
      where: {
        categoryId,
        category: {
          deleted: false,
        },
      },
      select: {
        id: true,
        question: true,
        choice: {
          select: {
            id: true,
            text: true,
          },
        },
        level: true,
      },
    });

    await this.setQuestionsToCache(cacheKey, questions);

    return questions;
  }

  async getQuestionsByLevel(
    categoryId: string,
    level: Level,
    take: number
  ): Promise<QuestionWithChoices[]> {
    const cacheKey = this.generateKey("level", { categoryId, level, take });

    // Try to get from cache
    const cached = await this.getQuestionsFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, get from DB
    const questions = await prisma.question.findMany({
      where: {
        categoryId,
        level,
        category: {
          deleted: false,
        },
      },
      take,
      select: {
        id: true,
        question: true,
        choice: {
          select: {
            id: true,
            text: true,
          },
        },
        level: true,
      },
    });

    // Store in cache
    await this.setQuestionsToCache(cacheKey, questions);

    return questions;
  }

  async getSimulationQuestions(
    type: "single" | "multiple",
    take: number
  ): Promise<QuestionWithChoices[]> {
    const cacheKey = this.generateKey("simulation", { type, take });

    // Try to get from cache
    const cached = await this.getQuestionsFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, get from DB
    const questions = await prisma.question.findMany({
      where: {
        isMultipleAnswer: type === "multiple",
        category: {
          deleted: false,
        },
      },
      take,
      select: {
        id: true,
        title: true,
        choice: {
          select: {
            id: true,
            text: true,
          },
        },
        level: true,
      },
    });

    // Store in cache
    await this.setQuestionsToCache(cacheKey, questions);

    return questions;
  }

  async invalidateCache(): Promise<void> {
    const keys = await this.redis.keys("questions:*");
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export const questionCache = new RedisQuestionCache();
