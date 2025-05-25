// src/rate-limiting/rate-limiting.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitingService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async checkRateLimit(
    identifier: string,
    limit: number,
    windowInSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `rate_limit:${identifier}`;
    const current = await this.redis.incr(key);
    console.log('Redis data', current);
    if (current === 1) {
      await this.redis.expire(key, windowInSeconds);
    }

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  }
}
