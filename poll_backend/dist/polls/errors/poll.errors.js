"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidOptionError = exports.AlreadyVotedError = exports.PollExpiredError = void 0;
class PollExpiredError extends Error {
    constructor() {
        super('This poll has expired');
        this.name = 'PollExpiredError';
    }
}
exports.PollExpiredError = PollExpiredError;
class AlreadyVotedError extends Error {
    constructor() {
        super('You have already voted in this poll');
        this.name = 'AlreadyVotedError';
    }
}
exports.AlreadyVotedError = AlreadyVotedError;
class InvalidOptionError extends Error {
    constructor() {
        super('Invalid option index');
        this.name = 'InvalidOptionError';
    }
}
exports.InvalidOptionError = InvalidOptionError;
//# sourceMappingURL=poll.errors.js.map