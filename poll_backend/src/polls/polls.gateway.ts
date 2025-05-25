/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { BadRequestException } from '@nestjs/common';
import { PollExpiredError } from './errors/poll.errors';
import { RateLimitingService } from 'src/service/rate-limit.service';
import { ConfigService } from '@nestjs/config';
import { ThrottlerException } from '@nestjs/throttler/dist/throttler.exception';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class PollsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly pollsService: PollsService,
    private readonly rateLimitingService: RateLimitingService,
    private readonly configService: ConfigService,
  ) {}

  @SubscribeMessage('create_poll')
  async handleCreatePoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() createPollDto: CreatePollDto,
  ) {
    try {
      const ip = client.handshake.address;
      const limit = this.configService.get<number>('POLL_CREATE_LIMIT', 5);
      const window = this.configService.get<number>('POLL_CREATE_WINDOW', 60);

      const rateLimit = await this.rateLimitingService.checkRateLimit(
        `poll_create:${ip}`,
        limit,
        window,
      );

      if (!rateLimit.allowed) {
        throw new ThrottlerException('Too many poll creations');
      }

      // Validate expiry date
      const expiryDate = new Date(createPollDto.expiryDate);
      if (expiryDate <= new Date()) {
        throw new BadRequestException('Expiry date must be in the future');
      }

      // Create will handle the options conversion
      const poll = await this.pollsService.create(createPollDto);
      this.server.emit('new_poll', poll);
      return { success: true, poll };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.response?.message || error.message,
          status: error instanceof ThrottlerException ? 429 : 500,
        },
      };
    }
  }

  @SubscribeMessage('vote')
  async handleVote(client: Socket, voteData: any) {
    try {
      // Add rate limiting here too
      const ip = client.handshake.address;
      const limit = this.configService.get<number>('VOTE_LIMIT', 30);
      const window = this.configService.get<number>('VOTE_WINDOW', 60);

      const rateLimit = await this.rateLimitingService.checkRateLimit(
        `vote:${ip}`,
        limit,
        window,
      );

      if (!rateLimit.allowed) {
        throw new ThrottlerException('Too many votes');
      }

      // Verify poll exists and is active first
      const poll = await this.pollsService.findOneById(voteData.pollId);
      if (poll.isExpired) {
        throw new PollExpiredError();
      }
      const userId = client.handshake.auth.userId || `user-${client.id}`;
      const updatedPoll = await this.pollsService.vote({ ...voteData, userId });
      this.server.emit('poll_updated', updatedPoll);
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  @SubscribeMessage('request_polls')
  async handleRequestPolls(_client: Socket) {
    const polls = await this.pollsService.findAll();
    return { success: true, polls };
  }
}

/*
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PollsService } from './polls.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class PollsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly pollsService: PollsService) {}

  @SubscribeMessage('create_poll')
  async handleCreatePoll(client: Socket, createPollDto: any) {
    const poll = await this.pollsService.create(createPollDto);
    this.server.emit('new_poll', poll);
    return { success: true, poll };
  }

  @SubscribeMessage('vote')
  async handleVote(client: Socket, voteData: any) {
    try {
      const userId = client.handshake.auth.userId || `user-${client.id}`;
      const updatedPoll = await this.pollsService.vote({ ...voteData, userId });
      this.server.emit('poll_updated', updatedPoll);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('request_polls')
  async handleRequestPolls(client: Socket) {
    const polls = await this.pollsService.findAll();
    return { success: true, polls };
  }
}
*/
