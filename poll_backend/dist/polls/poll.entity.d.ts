export declare class Poll {
    id: string;
    question: string;
    options: {
        text: string;
        votes: number;
    }[];
    votedUsers: string[];
    expiryDate: Date;
    isExpired: boolean;
}
