/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { networkInterfaces } from 'os';
import { AllExceptionsFilter } from './service/http-exception.filter';
import helmet from 'helmet';
import * as csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Content-Range,X-Content-Range',
    maxAge: 3600,
  });
  // Security headers (OWASP)
  app.use(helmet());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", 'ws:'],
          frameAncestors: ["'none'"],
        },
      },
      hsts: {
        maxAge: 63072000, // 2 years in seconds
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'same-origin' },
    }),
  );
  // Additional security middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // CSRF protection for non-GET endpoints
  app.use(csurf());

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Enable custom exceptions
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  // Get IPv4 address
  const nets = networkInterfaces();
  const ipv4 = Object.values(nets)
    .flat()
    .find((net) => net?.family === 'IPv4' && !net?.internal)?.address;

  console.log(`Application is running on: http://${ipv4}:${port}`);
  console.log(`Local: http://localhost:${port}`);
}

void bootstrap();
