export declare class CreatePollDto {
    question: string;
    options: string[];
    votedUsers: string[];
    expiryDate: Date;
    isExpired: boolean;
}
