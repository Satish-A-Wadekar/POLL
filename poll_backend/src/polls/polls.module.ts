import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { Poll } from './poll.entity';
import { PollsGateway } from './polls.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Poll])],
  controllers: [PollsController],
  providers: [PollsService, PollsGateway],
})
export class PollsModule {}
