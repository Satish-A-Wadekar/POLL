// src/hooks/useRateLimit.js
// src/hooks/useRateLimit.js
import { useState, useEffect } from 'react';

export const useRateLimit = (actionKey, limit, windowInMs) => {
    const [remaining, setRemaining] = useState(limit);
    const [isLimited, setIsLimited] = useState(false);
    const [resetTime, setResetTime] = useState(null);

    // Revalidate rate limit status periodically
    const revalidate = () => {
        const now = Date.now();
        const actions = JSON.parse(localStorage.getItem(`rateLimit_${actionKey}`)) || [];
        const validActions = actions.filter(time => now - time < windowInMs);
        
        const newRemaining = limit - validActions.length;
        setRemaining(newRemaining);
        setIsLimited(newRemaining <= 0);

        // Set the earliest reset time (oldest action + window)
        const nextReset = validActions.length > 0 ? (new Date(Math.min(...validActions) + windowInMs)) : null;
        setResetTime(nextReset);

        localStorage.setItem(`rateLimit_${actionKey}`, JSON.stringify(validActions));
    };

    // Initial validation and cleanup
    useEffect(() => {
        revalidate();
    }, [actionKey, limit, windowInMs]);

    // Auto-revalidate when resetTime is reached
    useEffect(() => {
        if (!resetTime) return;

        const timeRemaining = resetTime - Date.now();
        if (timeRemaining <= 0) {
            revalidate();
            return;
        }

        const timer = setTimeout(revalidate, timeRemaining);
        return () => clearTimeout(timer);
    }, [resetTime]);

    const recordAction = () => {
        const now = Date.now();
        const actions = JSON.parse(localStorage.getItem(`rateLimit_${actionKey}`)) || [];
        actions.push(now);
        localStorage.setItem(`rateLimit_${actionKey}`, JSON.stringify(actions));

        setRemaining(prev => {
            const newRemaining = prev - 1;
            setIsLimited(newRemaining <= 0);
            return newRemaining;
        });

        setResetTime(new Date(now + windowInMs));
    };

    return { remaining, isLimited, resetTime, recordAction, revalidate };
};

