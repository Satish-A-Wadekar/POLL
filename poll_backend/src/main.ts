import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { networkInterfaces } from 'os';
import { AllExceptionsFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // SPECIFIC origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
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
