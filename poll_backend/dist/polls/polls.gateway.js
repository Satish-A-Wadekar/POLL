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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const polls_service_1 = require("./polls.service");
let PollsGateway = class PollsGateway {
    pollsService;
    server;
    constructor(pollsService) {
        this.pollsService = pollsService;
    }
    async handleCreatePoll(client, createPollDto) {
        const poll = await this.pollsService.create(createPollDto);
        this.server.emit('new_poll', poll);
        return { success: true, poll };
    }
    async handleVote(client, voteData) {
        try {
            const userId = client.handshake.auth.userId || `user-${client.id}`;
            const updatedPoll = await this.pollsService.vote({ ...voteData, userId });
            this.server.emit('poll_updated', updatedPoll);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleRequestPolls(client) {
        const polls = await this.pollsService.findAll();
        return { success: true, polls };
    }
};
exports.PollsGateway = PollsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PollsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('create_poll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "handleCreatePoll", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('vote'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "handleVote", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('request_polls'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], PollsGateway.prototype, "handleRequestPolls", null);
exports.PollsGateway = PollsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [polls_service_1.PollsService])
], PollsGateway);
//# sourceMappingURL=polls.gateway.js.map