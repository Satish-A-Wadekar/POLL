import { v4 as uuidv4 } from 'uuid';

// Get or create user ID
export const getOrCreateUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = uuidv4();
        localStorage.setItem('userId', userId);
    }
    return userId;
};

// Check if user voted in specific poll
export const hasUserVoted = (pollId) => {
    return localStorage.getItem(`poll_${pollId}_voted`) === 'true';
};

// Set vote status for a poll
export const setVoted = (pollId) => {
    localStorage.setItem(`poll_${pollId}_voted`, 'true');
};

// Cleanup old poll entries
export const cleanupPollStorage = (currentPollId) => {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('poll_') && !key.includes(currentPollId)) {
            localStorage.removeItem(key);
        }
    });
};