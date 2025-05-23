import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import {
  PollExpiredError,
  AlreadyVotedError,
  InvalidOptionError,
} from './errors/poll.errors';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollsRepository: Repository<Poll>,
  ) {}

  async create(createPollDto: CreatePollDto): Promise<Poll> {
    const poll = this.pollsRepository.create({
      ...createPollDto,
      options: createPollDto.options.map((option) => ({
        text: option,
        votes: 0,
      })),
      votedUsers: [],
      isExpired: false,
    });

    return this.pollsRepository.save(poll);
  }

  async vote(votePollDto: VotePollDto & { userId: string }): Promise<Poll> {
    // Ensure pollId is treated as string
    const pollId = String(votePollDto.pollId);

    const poll = await this.pollsRepository.findOne({
      where: { id: pollId },
    });

    if (!poll) {
      throw new NotFoundException(`Poll with ID ${pollId} not found`);
    }

    if (poll.isExpired) {
      throw new PollExpiredError();
    }

    if (poll.votedUsers.includes(votePollDto.userId)) {
      throw new AlreadyVotedError();
    }

    if (
      votePollDto.optionIndex < 0 ||
      votePollDto.optionIndex >= poll.options.length
    ) {
      throw new InvalidOptionError();
    }

    // Update vote count
    poll.options[votePollDto.optionIndex].votes += 1;
    poll.votedUsers.push(votePollDto.userId);

    return this.pollsRepository.save(poll);
  }

  async findAll(): Promise<Poll[]> {
    return this.pollsRepository.find();
  }

  // Add this new method to safely find polls by ID
  async findOneById(id: string): Promise<Poll> {
    const poll = await this.pollsRepository.findOneBy({ id });
    if (!poll) {
      throw new NotFoundException(`Poll with ID ${id} not found`);
    }
    return poll;
  }

  async checkExpiredPolls(): Promise<void> {
    const now = new Date();
    const polls = await this.pollsRepository.find({
      where: { isExpired: false },
    });

    const updatePromises = polls
      .filter((poll) => poll.expiryDate < now)
      .map((poll) =>
        this.pollsRepository.save({
          ...poll,
          isExpired: true,
        }),
      );

    await Promise.all(updatePromises);
  }
}
