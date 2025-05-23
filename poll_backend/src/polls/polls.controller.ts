/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { Request } from 'express';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get()
  findAll() {
    return this.pollsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.pollsService.findOneById(id);
  }

  @Post()
  create(@Body() createPollDto: CreatePollDto) {
    // No need for conversion, frontend should send Date-compatible string
    return this.pollsService.create(createPollDto);
  }

  @Post('vote')
  async vote(@Body() votePollDto: VotePollDto, @Req() req: Request) {
    const userId = (req as any).user?.id || `user-${Date.now()}`;
    return this.pollsService.vote({
      ...votePollDto,
      userId,
    });
  }
}
