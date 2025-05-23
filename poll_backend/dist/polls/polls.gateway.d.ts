import { Server, Socket } from 'socket.io';
import { PollsService } from './polls.service';
export declare class PollsGateway {
    private readonly pollsService;
    server: Server;
    constructor(pollsService: PollsService);
    handleCreatePoll(client: Socket, createPollDto: any): Promise<{
        success: boolean;
        poll: import("./poll.entity").Poll;
    }>;
    handleVote(client: Socket, voteData: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleRequestPolls(client: Socket): Promise<{
        success: boolean;
        polls: import("./poll.entity").Poll[];
    }>;
}
