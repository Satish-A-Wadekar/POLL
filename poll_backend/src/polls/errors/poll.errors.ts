export class PollExpiredError extends Error {
  constructor() {
    super('This poll has expired');
    this.name = 'PollExpiredError';
  }
}

export class AlreadyVotedError extends Error {
  constructor() {
    super('You have already voted in this poll');
    this.name = 'AlreadyVotedError';
  }
}

export class InvalidOptionError extends Error {
  constructor() {
    super('Invalid option index');
    this.name = 'InvalidOptionError';
  }
}
