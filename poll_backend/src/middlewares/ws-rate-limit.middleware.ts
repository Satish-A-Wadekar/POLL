// src/middleware/ws-rate-limit.middleware.ts
// src/middlewares/ws-rate-limit.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimitingService } from '../service/rate-limit.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsRateLimitMiddleware implements NestMiddleware {
  constructor(
    private readonly rateLimitingService: RateLimitingService,
    private readonly configService?: ConfigService, // Make optional
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.upgrade === 'websocket') {
      try {
        const ip = req.socket.remoteAddress;
        const limit = this.configService?.get<number>('WS_RATE_LIMIT') ?? 100;
        const window = this.configService?.get<number>('WS_RATE_WINDOW') ?? 60;

        const result = await this.rateLimitingService.checkRateLimit(
          `ws:${ip}`,
          limit,
          window,
        );

        if (!result.allowed) {
          req.socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
          req.socket.destroy();
          return;
        }
      } catch (error) {
        console.error('Rate limit error:', error);
      }
    }
    next();
  }
}
