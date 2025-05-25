/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './polls/poll.entity';
import { PollsModule } from './polls/polls.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './service/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitingService } from './service/rate-limit.service';
import { WsRateLimitMiddleware } from './middlewares/ws-rate-limit.middleware';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          limit: config.get<number>('HTTP_RATE_LIMIT', 100),
          ttl: config.get<number>('HTTP_RATE_WINDOW', 60) * 1000,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    /*
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Poll],
      synchronize: true,
    }),
    */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: 'db.sqlite',
        entities: [Poll],
        synchronize: true,
        ssl:
          process.env.NODE_ENV === 'production'
            ? {
                rejectUnauthorized: true,
                ca: config.get('DB_SSL_CERT'),
              }
            : null,
      }),
      inject: [ConfigService],
    }),
    PollsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    RateLimitingService,
    WsRateLimitMiddleware,
  ],
})
//export class AppModule {}
export class AppModule implements NestModule {
  constructor(private readonly wsRateLimitMiddleware: WsRateLimitMiddleware) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.wsRateLimitMiddleware.use.bind(this.wsRateLimitMiddleware))
      .forRoutes('*');
  }
}
/*export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*'); // Applies to all routes
  }
}*/
