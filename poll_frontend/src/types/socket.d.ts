declare module 'socket.io-client' {
    interface Socket {
        emitWithAck: <T>(
            event: string,
            data: any
        ) => Promise<{
            success: boolean;
            error?: string;
            errorType?: string;
            poll?: T;
        }>;
    }
}

export interface SocketVoteResponse {
    success: boolean;
    error?: string;
    errorType?:
    | 'AlreadyVotedError'
    | 'PollExpiredError'
    | 'InvalidOptionError'
    | 'NetworkError';
    poll?: Poll;
}
