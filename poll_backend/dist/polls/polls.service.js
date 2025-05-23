"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const poll_entity_1 = require("./poll.entity");
const poll_errors_1 = require("./errors/poll.errors");
let PollsService = class PollsService {
    pollsRepository;
    constructor(pollsRepository) {
        this.pollsRepository = pollsRepository;
    }
    async create(createPollDto) {
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
    async vote(votePollDto) {
        const pollId = String(votePollDto.pollId);
        const poll = await this.pollsRepository.findOne({
            where: { id: pollId },
        });
        if (!poll) {
            throw new common_1.NotFoundException(`Poll with ID ${pollId} not found`);
        }
        if (poll.isExpired) {
            throw new poll_errors_1.PollExpiredError();
        }
        if (poll.votedUsers.includes(votePollDto.userId)) {
            throw new poll_errors_1.AlreadyVotedError();
        }
        if (votePollDto.optionIndex < 0 ||
            votePollDto.optionIndex >= poll.options.length) {
            throw new poll_errors_1.InvalidOptionError();
        }
        poll.options[votePollDto.optionIndex].votes += 1;
        poll.votedUsers.push(votePollDto.userId);
        return this.pollsRepository.save(poll);
    }
    async findAll() {
        return this.pollsRepository.find();
    }
    async findOneById(id) {
        const poll = await this.pollsRepository.findOneBy({ id });
        if (!poll) {
            throw new common_1.NotFoundException(`Poll with ID ${id} not found`);
        }
        return poll;
    }
    async checkExpiredPolls() {
        const now = new Date();
        const polls = await this.pollsRepository.find({
            where: { isExpired: false },
        });
        const updatePromises = polls
            .filter((poll) => poll.expiryDate < now)
            .map((poll) => this.pollsRepository.save({
            ...poll,
            isExpired: true,
        }));
        await Promise.all(updatePromises);
    }
};
exports.PollsService = PollsService;
exports.PollsService = PollsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(poll_entity_1.Poll)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PollsService);
//# sourceMappingURL=polls.service.js.map