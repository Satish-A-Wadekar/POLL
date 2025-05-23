import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { Request } from 'express';
export declare class PollsController {
    private readonly pollsService;
    constructor(pollsService: PollsService);
    findAll(): Promise<import("./poll.entity").Poll[]>;
    findOne(id: string): Promise<import("./poll.entity").Poll>;
    create(createPollDto: CreatePollDto): Promise<import("./poll.entity").Poll>;
    vote(votePollDto: VotePollDto, req: Request): Promise<import("./poll.entity").Poll>;
}
