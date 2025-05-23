/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
