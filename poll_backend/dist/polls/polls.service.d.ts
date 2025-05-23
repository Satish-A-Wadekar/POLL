import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
export declare class PollsService {
    private pollsRepository;
    constructor(pollsRepository: Repository<Poll>);
    create(createPollDto: CreatePollDto): Promise<Poll>;
    vote(votePollDto: VotePollDto & {
        userId: string;
    }): Promise<Poll>;
    findAll(): Promise<Poll[]>;
    findOneById(id: string): Promise<Poll>;
    checkExpiredPolls(): Promise<void>;
}
